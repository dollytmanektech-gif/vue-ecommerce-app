export function registerUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem("isAuthenticated", "true");
  return true
}

export function loginUser(email, password) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user && user.email === email && user.password === password) {
    localStorage.setItem("isAuthenticated", "true");
    return true;
  }

  return false;
}

function logout() {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  console.log('After:', localStorage.getItem('isAuthenticated'))
  router.push('/login')
}

export function isAuthenticated() {
  return localStorage.getItem('isAuthenticated') === 'true'
}
