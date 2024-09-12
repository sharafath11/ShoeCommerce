import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from "../../models/userModel.js";
import session from 'express-session';

// Function to handle GET request for login page
export const loginGetFn = (req, res) => {
  res.render("user/login");
};

// Function to handle POST request for login
export const loginPost = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await userModel.findOne({ email });

    // if (!user) {
    //   return res.status(400).send(`
    //     <html>
    //       <script>
    //         alert('Invalid password! or User not found!');
    //         window.location.href = '/login';  // Redirect after alert
    //       </script>
    //     </html>
    //   `);
    // }

    // Compare provided password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch || ! user) {
      return res.status(400).send(`
        <html>
          <script>
            alert('Invalid password! or User not found!');
            window.location.href = '/login';  // Redirect after alert
          </script>
        </html>
      `);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expiration time
    );

    // Send token to the user
    req.session.token=token;
    req.session.user=user
    
    
    res.status(200).redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send(`
      <html>
        <script>
          alert('Server error');
          window.location.href = '/login';  // Redirect after alert
        </script>
      </html>
    `);
  }
};
