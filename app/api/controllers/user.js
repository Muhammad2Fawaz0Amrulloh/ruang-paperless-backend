module.exports = {
    getProfile: (req, res) => {
        const user = req.user;

        res.status(200).json({
            data: user,
        })
    },
}