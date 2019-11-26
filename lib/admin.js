const User = require ('../models/User');
const {hash} = require ('./helpers');

const createAdmin = async () => {
  const user = {
    email: 'admin@breezerentals.gr',

    isAdmin: true,
  };
  const password = process.env.ADMIN_PASS;
  if (!password) return console.log ('no password passed');

  user.password = await hash (password);

  const admin = await new User (user);
  //console.log (user);
  try {
    await admin.save ();
  } catch (error) {
    console.log ('error', error);
  }
  console.log ('admin', admin);

  console.log ('gsdg');
};
// createAdmin ();

const getUsers = async () => {
  const users = await User.find ({});
  console.log ('users', users);
};
getUsers ();
