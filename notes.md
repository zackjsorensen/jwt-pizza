# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |   home.tsx         |  None             |      None    |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx       | authRouter.post   |`INSERT INTO user (name, email, password) VALUES (?, ?, ?)`|
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx          | authRouter.put    |`SELECT * FROM user WHERE email=?`|
| Order pizza                                         | menu.tsx           | orderRouter.get   |`SELECT * FROM menu`|
| Verify pizza                                        | delivery.tsx       |'/api/order/verify'|   N/A        |
| View profile page                                   | dinerDashboard.tsx | orderRouter.get   |`SELECT id, menuId, description, price FROM orderItem WHERE orderId=?`|
| View franchise<br/>(as diner)                     |franchiseDashboard.tsx|franchiseRouter.get|SELECT id, name FROM franchise WHERE name LIKE ?|
| Logout                                              |  logout.tsx        | authRouter.delete |DELETE FROM auth WHERE token=?|
| View About page                                     |  about.tsx         |        N/A        |       N/A    |
| View History page                                   |  history.tsx       |         N/A       |       N/A    |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx          | authRouter.put    |`SELECT * FROM user WHERE email=?`|
| View franchise<br/>(as franchisee)                |franchiseDashboard.tsx|franchiseRouter.get|'SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?'|
| Create a store                                      | createStore.tsx    |franchiseRouter.post`INSERT INTO store (franchiseId, name) VALUES (?, ?)`|
| Close a store                                       |closeStore.tsx      |franchiseRouter.delete|`DELETE FROM store WHERE franchiseId=? AND id=?`|
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx          | authRouter.put    |`SELECT * FROM user WHERE email=?`|
| View Admin page                                     |adminDashboard.tsx  |franchiseRouter.get|`SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee`|
| Create a franchise for t@jwt.com                    |createFranchise.tsx |franchiseRouter.post|`SELECT id, name FROM user WHERE email=?`|
| Close the franchise for t@jwt.com                   |closeFranchise.tsx  |franchiseRouter.delete|`DELETE FROM store WHERE franchiseId=?`|
