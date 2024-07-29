const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const { PDFDocument } = require('pdf-lib');
const PDFParser = require('pdf-parse');
const qrcode = require("qrcode");
const config = require("../../../config");
const { signWithRSA, verifyWithRSA } = require("../../helper/rsa");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const { User, Document, Key, DocumentRecipient, PenandaTangan } = require("../../../models");
const { extractUniqueFields } = require("../../helper/document");
const { signWithDSA, encryptWithAES, verifyWithDSA, decryptWithAES } = require("../../helper/dsa");

dotenv.config();

module.exports = {
    uploadDocument: async (req, res) => {
        try {
            if (req.file) {
                const { document_name } = req.body;
                const user = req.user;

                // Generate document_id
                const length = 16;
                charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                let document_id = "";
                for (var i = 0, n = charset.length; i < length; ++i) {
                    document_id += charset.charAt(Math.floor(Math.random() * n));
                };

                // Read the document
                const dataBuffer = fs.readFileSync(req.file.path);

                // Parse the PDF
                const pdf = await PDFParser(dataBuffer);
                const plainText = pdf.text;

                // Extract unique fields
                const fields = extractUniqueFields(plainText);

                let tmp_path = req.file.path;
                let originalNotExt =
                    req.file.originalname.split(".")[0];
                let originalExt =
                    req.file.originalname.split(".")[
                    req.file.originalname.split(".").length - 1
                    ];
                const currentdate = new Date();
                const datetime = currentdate.getHours() + ""
                    + currentdate.getMinutes() + ""
                    + currentdate.getMilliseconds() + ""
                    + currentdate.getDate() + ""
                    + (currentdate.getMonth() + 1) + ""
                    + currentdate.getFullYear();
                let filename = originalNotExt + "_" + datetime + "." + originalExt;

                let target_path = path.resolve(
                    config.rootPath,
                    `public/uploads/document/${filename}`
                );

                const src = fs.createReadStream(tmp_path);
                const dest = fs.createWriteStream(target_path);

                await src.pipe(dest);

                const fileData = fs.readFileSync(tmp_path);

                const pdfDoc = await PDFDocument.load(fileData);
                let qrCodePath = path.resolve(`public/images/qrcode-${document_id}.png`);
                qrcode.toFile(qrCodePath, `${process.env.FRONTEND_URL}/document-verify/${document_id}`, {
                    errorCorrectionLevel: "H"
                }, async (err) => {
                    if (err) throw err;
                    const pages = pdfDoc.getPages();
                    const firstPage = pages[pages.length - 1];

                    let img = fs.readFileSync(qrCodePath);

                    img = await pdfDoc.embedPng(img);

                    const { width } = firstPage.getSize();

                    firstPage.drawImage(img, {
                        x: width - 120,
                        y: 50,
                        width: 80,
                        height: 80,
                    });

                    const qrPdfBytesTemp = await pdfDoc.save();

                    let filename = 'draft-' + originalNotExt + "_" + datetime + "." + originalExt;

                    fs.writeFileSync(`public/uploads/document/${filename}`, qrPdfBytesTemp);

                });

                const data = {
                    document_id,
                    document_name,
                    nomor_surat: fields.nomor_surat,
                    perihal_surat: fields.perihal_surat,
                    tanggal_surat: fields.tanggal_surat,
                    tujuan_surat: fields.tujuan_surat,
                    kota_surat: fields.kota_surat,
                    document_path: filename,
                    created_by: user.user_id,
                    updated_by: user.user_id,
                }

                await Document.create(data);

                if (fields.PenandaTangan) {
                    fields.PenandaTangan.map(async (penanda) => {
                        await PenandaTangan.create({
                            document_id,
                            nama: penanda.nama,
                            jabatan: penanda.jabatan,
                            instansi: penanda.instansi,
                            created_by: user.user_id,
                            updated_by: user.user_id,
                        })
                    })
                }

                res.status(201).json({
                    message: "Sukses menyimpan dokumen.",
                    data: {
                        document_id,
                    }
                })

            } else {
                res.status("404").json({
                    message: "Dokumen perlu di upload!",
                })
            };
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    getAllUserDocument: async (req, res) => {
        try {
            const user = req.user;
            const { status } = req.query;

            if (status) {
                console.log(status)
                if (status === "signed") {
                    const documents = await Document.findAll({
                        where: {
                            created_by: user.user_id,
                            status,
                        },
                        include: [
                            {
                                attributes: ["document_recipient_id", "email", "note", "created_at"],
                                model: DocumentRecipient,
                                as: 'documentrecipients',
                            },
                        ]
                    });

                    res.status(200).json({
                        data: documents
                    });
                } else if (status === "draft") {
                    const documents = await Document.findAll({
                        where: {
                            created_by: user.user_id,
                            status: 'not-signed'
                        },
                        include: [
                            {
                                attributes: ["document_recipient_id", "email", "note", "created_at"],
                                model: DocumentRecipient,
                                as: 'documentrecipients',
                            }
                        ]
                    });

                    res.status(200).json({
                        data: documents
                    });

                } else {
                    res.status(404).json({
                        message: "Data tidak ditemukan"
                    });
                }
            } else {
                const documents = await Document.findAll({
                    where: {
                        created_by: user.user_id,
                        status: {
                            [Op.not]: 'deleted'
                        }
                    },
                    include: [
                        {
                            attributes: ["document_recipient_id", "email", "note", "created_at"],
                            model: DocumentRecipient,
                            as: 'documentrecipients',
                        }
                    ]
                });

                res.status(200).json({
                    data: documents
                });
            };
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    getDocumentDetail: async (req, res) => {
        try {
            const { id } = req.params;

            const document = await Document.findOne({
                attributes: ['document_id', 'created_by', 'document_name', 'signed_by', 'document_path', 'created_at', 'updated_at'],
                where: {
                    document_id: id,
                    status: {
                        [Op.not]: 'deleted'
                    }
                },
                include: [
                    {
                        model: User,
                        as: "document_created_by",
                        attributes: ['fullname', 'email']
                    },
                    {
                        model: PenandaTangan,
                        as: "penandatangans",
                        attributes: ['nama', 'instansi', 'jabatan']
                    },
                ]
            });

            if (document !== null) {
                res.status(200).json({
                    message: "Dokumen ditemukan",
                    data: document,
                });
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan."
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        };
    },

    documentSign: async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            const checkKey = await Key.findOne({ where: { user_id: user.user_id } });

            if (!checkKey) {
                // Generate DSA key pair
                const { privateKey, publicKey } = crypto.generateKeyPairSync('dsa', {
                    modulusLength: 1024,
                    publicKeyEncoding: {
                        type: 'spki',
                        format: 'pem',
                    },
                    privateKeyEncoding: {
                        type: 'pkcs8',
                        format: 'pem',
                    },
                });

                const aesKey = crypto.randomBytes(16); // AES-128 key
                const iv = crypto.randomBytes(16); // Initialization vector

                await Key.create({
                    user_id: user.user_id,
                    public_key: publicKey,
                    private_key: privateKey,
                    aes_key: aesKey.toString('hex'),
                    iv: iv.toString('hex'),
                    created_by: user.user_id,
                    updated_by: user.user_id,
                });
            }

            const keys = await Key.findOne({ where: { user_id: user.user_id } });

            const document = await Document.findOne({
                attributes: ['document_path', 'document_id'],
                where: {
                    document_id: id,
                    created_by: user.user_id,
                }
            });

            if (document !== null) {
                const doc = document;

                const targetPath = path.resolve(
                    config.rootPath,
                    `public/uploads/document/draft-${doc.document_path}`
                );

                const fileData = fs.readFileSync(targetPath);

                const pdfDoc = await PDFDocument.load(fileData);
                const pdfData = await PDFParser(fileData);

                // Tandatangani data PDF menggunakan kunci privat DSA
                const signature = signWithDSA(keys.private_key, pdfData.text);

                // Enkripsi tanda tangan dengan AES-128
                const aesKey = Buffer.from(keys.aes_key, 'hex');
                const iv = Buffer.from(keys.iv, 'hex');
                const encryptedSignature = encryptWithAES(signature, aesKey, iv);

                pdfDoc.setSubject(encryptedSignature);
                const signedPdfBytesTemp = await pdfDoc.save();

                const draftPdf = path.resolve(`public/uploads/document/draft-${doc.document_path}`);

                fs.unlinkSync(draftPdf);

                fs.writeFileSync(`public/uploads/document/signed-${doc.document_path}`, signedPdfBytesTemp);

                await Document.update(
                    { status: 'signed', signed_by: user.user_id, updated_at: Sequelize.literal('CURRENT_DATE'), updated_by: user.user_id },
                    {
                        where: {
                            document_id: id,
                            created_by: user.user_id
                        },
                    }
                );

                res.status(201).json({
                    message: "Berhasil menanda tangani dokumen.",
                });

            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan."
                });
            }

        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    documentVerify: async (req, res) => {
        try {
            const { id } = req.params;

            const document = await Document.findOne({
                attributes: ['document_id', 'document_path', 'created_by'],
                where: {
                    document_id: id
                }
            });

            if (document) {
                if (req.file) {
                    const tmpPath = req.file.path;

                    const fileData = fs.readFileSync(tmpPath);
                    const pdfDoc = await PDFDocument.load(fileData);
                    const pdfData = await PDFParser(fileData);

                    const encryptedSignature = pdfDoc.getSubject();

                    if (encryptedSignature) {
                        const keys = await Key.findOne({
                            attributes: ['public_key', 'aes_key', 'iv'],
                            where: {
                                user_id: document.created_by
                            }
                        });

                        if (keys) {
                            const aesKey = Buffer.from(keys.aes_key, 'hex');
                            const iv = Buffer.from(keys.iv, 'hex');

                            // Dekripsi tanda tangan dengan AES-128
                            const signature = decryptWithAES(encryptedSignature, aesKey, iv);

                            // Verifikasi tanda tangan dengan DSA
                            const isSignatureValid = verifyWithDSA(keys.public_key, pdfData.text, signature);

                            if (isSignatureValid) {
                                res.status(200).json({
                                    message: "Tanda tangan digital pada file PDF VALID"
                                });
                            } else {
                                res.status(404).json({
                                    message: "Tanda tangan digital pada file PDF TIDAK VALID"
                                });
                            }
                        } else {
                            res.status(404).json({
                                message: "Kunci publik tidak ditemukan untuk dokumen ini."
                            });
                        }
                    } else {
                        res.status(404).json({
                            message: "Dokumen belum terdapat tanda tangan!"
                        });
                    }
                } else {
                    res.status(404).json({
                        message: "Dokumen perlu di upload!"
                    });
                }
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan."
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`
            });
        }
    },



    documentDelete: async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            const updatedDocument = await Document.update(
                {
                    status: 'deleted',
                    deleted_at: new Date(),
                    deleted_by: user.user_id,
                },
                {
                    where: {
                        document_id: id,
                        created_by: user.user_id,
                    },
                }
            );

            if (updatedDocument[0] > 0) {
                res.status(201).json({
                    message: "Sukses menghapus dokumen",
                });
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan atau tidak memiliki izin untuk dihapus",
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    documentSend: async (req, res) => {
        try {
            const user = req.user;
            const { id } = req.params;
            const { email, note } = req.body;

            const document = await Document.findOne({
                attributes: ['document_id', 'created_by', 'document_name', 'signed_by', 'document_path', 'created_at'],
                where: {
                    document_id: id,
                    status: {
                        [Op.not]: 'deleted'
                    }
                },
                include: [
                    {
                        model: User,
                        as: "document_created_by",
                        attributes: ['fullname', 'email']
                    }
                ]
            });

            if (document) {
                const viewLink = `${process.env.FRONTEND_URL}/view/${document.document_id}`;
                const verifyLink = `${process.env.FRONTEND_URL}/document-verify/${document.document_id}`;

                // Generate recipient_id
                var length = 16;
                charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                let recipient_id = "";
                for (var i = 0, n = charset.length; i < length; ++i) {
                    recipient_id += charset.charAt(Math.floor(Math.random() * n));
                };

                // Send to Email
                let configUser = {
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                    }
                }

                let transporter = nodemailer.createTransport(configUser);

                let MailGenerator = new Mailgen({
                    theme: "default",
                    product: {
                        name: "Ruang-Paperless",
                        link: 'https://ruang-paperless.com'
                    }
                })

                // Email body
                let response = {
                    product: {
                        name: 'Ruang-Paperless',
                        link: 'https://ruang-paperless.com',
                        logo: 'https://lh3.googleusercontent.com/drive-viewer/AITFw-yHxDSt40zK3K3hbahDR59__6QYn0P36jE0OJy0QVZRMMPsVNsxcKhD5Hny79_N4wRZAA1glueYlJ6wab2Jl6Qy-C-b=s1600',
                        logoHeight: '80px'
                    },
                    body: {
                        name: email,
                        intro: "Kami ingin memberitahukan bahwa ini adalah dokumen yang dikirimkan kepada Anda melalui web ruang-paperless. Berikut adalah deskripsi dari dokumen:",
                        dictionary: {
                            "Kode serial pengiriman": recipient_id,
                            "ID user ruang-paperless pengirm": user.user_id,
                            "Email pengirim": user.email,
                            "Nama dokumen": document.document_name,
                            "Catatan": note,
                        },
                        action: [
                            {
                                instructions: "Untuk mengunduh dokumen tersebut, silahkan klik tombol dibawah.",
                                button: {
                                    color: '#4F709C',
                                    text: 'Lihat Dokumen',
                                    link: viewLink,
                                }
                            },
                            {
                                button: {
                                    color: '#29A71A',
                                    text: 'Cek Validasi Dokumen',
                                    link: verifyLink,
                                }
                            },
                        ],
                        signature: 'Hormat Kami',
                    }
                }

                let mail = MailGenerator.generate(response)

                let message = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: `${user.fullname} mengirimkan Dokumen tertanda tangan digital ruang-paperless kepada anda, silahkan cek`,
                    html: mail,
                }

                transporter.sendMail(message).then(async (info) => {
                    const data = {
                        document_recipient_id: recipient_id,
                        document_id: id,
                        email,
                        note,
                        created_by: user.user_id,
                        updated_by: user.user_id,
                    };

                    await DocumentRecipient.create(data)

                    return res.status(201)
                        .json({
                            message: "Dokumen berhasil terkirim",
                        })
                }).catch(error => {
                    return res.status(500).json({ error });
                })
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan."
                });
            };
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        };
    },

    getDocumentRecipients: async (req, res) => {
        try {
            const user = req.user;

            const documentRecipients = await DocumentRecipient.findAll({
                attributes: ["document_recipient_id", "document_id", "note", "created_at"],
                where: {
                    email: user.email,
                    status: "active",
                },
                include: [
                    {
                        model: Document,
                        as: 'document',
                        attributes: ["document_id", "document_name", "created_at"],
                        include: [
                            {
                                model: User,
                                as: 'document_created_by',
                                attributes: ['fullname', 'email'],
                            },
                        ],
                    },
                ],
            });

            if (documentRecipients) {
                res.status(200).json({
                    message: "Berhasil mendapatkan data.",
                    data: documentRecipients,
                })
            } else {
                res.status(404).json({
                    message: "Data tidak ditemukan"
                });
            };
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        };
    },

    documentRecipientDelete: async (req, res) => {
        try {
            const { id } = req.params;
            const user = req.user;

            const updatedDocument = await DocumentRecipient.update(
                {
                    status: 'deleted',
                    deleted_at: new Date(),
                    deleted_by: user.user_id,
                },
                {
                    where: {
                        document_recipient_id: id,
                        email: user.email,
                    },
                }
            );

            if (updatedDocument[0] > 0) {
                res.status(201).json({
                    message: "Sukses menghapus pengiriman dokumen",
                });
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan atau tidak memiliki izin untuk dihapus",
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    documentDownload: async (req, res) => {
        try {
            const { id } = req.params;
            const { signed } = req.query;

            const document = await Document.findOne({
                attributes: ['document_id', 'document_path'],
                where: {
                    document_id: id
                }
            });

            if (document) {
                let filename = document.document_path;
                if (signed) {
                    filename = `signed-${document.document_path}`
                };

                res.sendFile(filename, { root: path.resolve(config.rootPath, `public/uploads/document/`) })
            } else {
                res.status(404).json({
                    message: "Dokumen tidak ditemukan!."
                })
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    }
};
