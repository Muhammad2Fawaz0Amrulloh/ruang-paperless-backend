const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const bcrypt = require("bcrypt");
const config = require("../../../config");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Model
const { User, Pin } = require("../../../models");

dotenv.config();

// For Hashing Password
const salt = 10;

module.exports = {
    register: async (req, res, next) => {
        try {
            let payload = req.body;

            const checkNIK = await User.findOne({ where: { nik: payload.nik } });

            if (checkNIK === null) {
                const checkEmail = await User.findOne({ where: { email: payload.email } });

                if (checkEmail === null) {
                    // Generate user_id
                    let getUser;
                    do {
                        charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        user_id = payload.fullname.charAt(0);
                        for (var i = 0, n = charset.length; i < 8; ++i) {
                            user_id += charset.charAt(Math.floor(Math.random() * n));
                        };

                        getUser = await User.findOne({ where: { user_id } });
                    } while (getUser !== null);

                    // Generate random password
                    var length = 15;
                    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                    password = "";
                    for (var i = 0, n = charset.length; i < length; ++i) {
                        password += charset.charAt(Math.floor(Math.random() * n));
                    };

                    // Generate random pin_id
                    var length = 16;
                    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
                    pin_id = "";
                    for (var i = 0, n = charset.length; i < length; ++i) {
                        pin_id += charset.charAt(Math.floor(Math.random() * n));
                    };

                    // Generate random pin
                    var length = 6;
                    charset = "0123456789";
                    genPin = "";
                    for (var i = 0, n = charset.length; i < length; ++i) {
                        genPin += charset.charAt(Math.floor(Math.random() * n));
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
                            name: payload.fullname,
                            intro: "Selamat datang di Ruang-Paperless! Daftar akun Anda telah berhasil. Silakan masuk dengan menggunakan password di bawah ini, dan gunakan PIN yang ada untuk proses tanda tangan dokumen:",
                            dictionary: {
                                Password: password,
                                PIN: genPin
                            },
                            action: {
                                instructions: "Klik tombol di bawah untuk melanjutkan ke proses masuk.",
                                button: {
                                    color: '#1E90FF',
                                    text: 'Masuk Sekarang',
                                    link: 'https://ruang-paperless.com/signin'
                                }
                            },
                            signature: 'Hormat Kami',
                        }
                    };

                    let mail = MailGenerator.generate(response)

                    let message = {
                        from: process.env.EMAIL,
                        to: payload.email,
                        subject: "Daftar Akun Berhasil, Silahkan Lihat Password",
                        html: mail,
                    }

                    // Password Encrypted
                    bcrypt.hash(password, salt, async (err, hash) => {
                        if (err) throw error;

                        payload = {
                            ...payload,
                            user_id,
                            password: hash,
                            quota: 10,
                            created_by: user_id,
                            updated_by: user_id,
                        }

                        bcrypt.hash(genPin, salt, async (err, hash) => {
                            if (err) throw error;

                            await User.create(payload);

                            await Pin.create({ pin_id, pin: hash, user_id, created_by: user_id, updated_by: user_id })

                            transporter.sendMail(message).then((info) => {
                                return res.status(201)
                                    .json({
                                        message: "Daftar berhasil, Email pendaftaran telah terkirim.",
                                        password,
                                    })
                            }).catch(error => {
                                return res.status(500).json({ error });
                            });
                        });
                    });
                } else {
                    return res.status(422).json({
                        message: "Email yang digunakan sudah terdaftar!"
                    })
                }
            } else {
                return res.status(422).json({
                    message: "NIK sudah digunakan sebelumnya!"
                })
            }

        } catch (err) {
            if (err && err.name === "ValidationError") {
                return res.status(422).json({
                    error: 1,
                    message: err.message,
                    fields: err.errors,
                });
            };
            next(err);
        };
    },

    signIn: async (req, res) => {
        try {
            const { email, password } = req.body;

            const getUser = await User.findOne({ where: { email } });

            if (getUser !== null) {
                bcrypt.compare(password, getUser.password, async (error, response) => {
                    if (response) {
                        const token = jwt.sign(
                            {
                                user: {
                                    user_id: getUser.user_id,
                                    nik: getUser.nik,
                                    fullname: getUser.fullname,
                                    email: getUser.email,
                                    birth_date: getUser.birth_date,
                                    phone_number: getUser.phone_number,
                                    quota: getUser.quota,
                                }
                            },
                            config.jwtKey
                        );

                        await User.update({ last_signin: new Date(), status: "verified", update_at: new Date }, {
                            where: {
                                user_id: getUser.user_id,
                            }
                        })

                        res.status(200).json({
                            data: {
                                token
                            }
                        })

                    } else {
                        res.status(403).json({
                            message: "Password yang anda masukkan salah!",
                        })
                    }
                })
            } else {
                res.status(403).json({
                    message: "email yang anda masukkan belum terdaftar.",
                });
            }
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    },

    pinValidation: async (req, res) => {
        try {
            const user = req.user;
            const { pin } = req.body;

            getPin = await Pin.findOne({ where: { user_id: user.user_id } });

            bcrypt.compare(pin, getPin.pin, async (error, response) => {
                if (response) {
                    res.status(200).json({
                        message: "PIN Valid",
                    });
                } else {
                    res.status(403).json({
                        message: "PIN Tidak Valid",
                    });
                };
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || `Internal server error!`,
            });
        }
    }
}