import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from "../../models/userModel.js";


// Function to handle GET request for login page
export const loginGetFn = (req, res) => {
  const user=req.session.user
  const WishlistQty= req.session.WishlistQty
 const cartQty= req.session.cartQty
  res.render("user/login",{user,WishlistQty,cartQty});
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
    req.session.toast="login success"
    
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
