import express, { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/authentication.middleware';
import { AuthController } from './auth.controller';

const auth = Router();
const controller = new AuthController();

auth.use(express.json());

auth.post('/login', controller.login);
auth.post('/forgotPass', controller.forgotPassword);
auth.put('/newPassword', controller.newPassword);
auth.post('/signUp', ensureAuthenticated, controller.signUp);
auth.put('/changePassword', ensureAuthenticated, controller.changePassword);
auth.get('/findAll', controller.findAllUsers);
auth.put('/edit/:id', controller.editUser);
auth.put('/firstAccess', ensureAuthenticated, controller.firstAccess);
auth.get('/findById/:id', controller.findUserById);
auth.put('/inactivate/:id', controller.inactivateUser);
auth.post('/refreshToken', controller.refreshToken);

export { auth };
