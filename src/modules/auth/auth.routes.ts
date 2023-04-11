import express, { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/authentication.middleware';
import { AuthController } from './auth.controller';

const auth = Router();
const controller = new AuthController();

auth.use(express.json());

auth.post('/login', controller.login);
auth.post('/signUp', controller.signUp);
auth.post('/refreshToken', controller.refreshToken);

auth.put('/edit/:id', controller.editUser);
auth.put('/changePassword', ensureAuthenticated, controller.changePassword);

auth.get('/findAll', controller.findAllUsers);
auth.get('/findById/:id', controller.findUserById);

export { auth };
