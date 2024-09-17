export const getAdmin = (req, res) => {
  if (req.session.admin) {
    res.render("admin/index");
  }
  else{
    res.redirect("/")
  }
};
