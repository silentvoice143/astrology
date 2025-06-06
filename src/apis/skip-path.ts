// List of API endpoints to skip auth token
const skipAuthPaths = [
  '/auth/login',
  '/auth/register',
  '/public-route',
  // add more routes as needed
];

export default skipAuthPaths;
