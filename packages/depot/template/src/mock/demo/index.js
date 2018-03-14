module.exports = {
  'POST /loginSubmit': (req, res) => {
    const { body } = req;
    res.json(body);
  }
}