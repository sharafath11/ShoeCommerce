import { otpStore } from "./otpController.js";

export const registerGetFn = (req, res) => {
  res.render("user/register");
};
export const userResiter = (req, res) => {
  const { email, otp } = req.body;
  

  if (otpStore[email] && otpStore[email].expiresAt > Date.now()) {
    if (otpStore[email].code === otp) {
      // OTP is correct and valid
      delete otpStore[email]; 
      return res.redirect("/");  // Successful registration
    } else {
      // Invalid OTP, display alert and redirect to register
      res.send(`
        <html>
          <script>
            alert('Invalid OTP!');
            window.location.href = '/register';  // Redirect after alert
          </script>
        </html>
      `);
    }
  } else {
    // OTP has expired or not found, display alert and redirect to register
    res.send(`
      <html>
        <script>
          alert('OTP has expired or not found!');
          window.location.href = '/register';  // Redirect after alert
        </script>
      </html>
    `);
  }
};
