const express = require('express');
const router = express.Router();

// role: "full" = full edit, "time" = time edit only
const ACCOUNTS = [
  { username: 'adminMay', password: 'asdfasdfasdf', role: 'full' },
  { username: 'adminKem', password: 'asdfasdfasdf', role: 'full' },
  { username: 'adminAu',  password: 'asdfasdfasdf', role: 'time' },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const account = ACCOUNTS.find(
    (a) => a.username === username && a.password === password
  );

  if (account) {
    return res.json({
      success: true,
      token: 'token-' + account.username + '-' + Date.now(),
      role: account.role,
      username: account.username,
    });
  }

  res.status(401).json({ success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
});

module.exports = router;
