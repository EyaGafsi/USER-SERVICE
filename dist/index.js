"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const axios = require('axios');
const memoryStore = new session.MemoryStore();
const kcConfig = {
    clientId: 'flyware-client',
    bearerOnly: true,
    serverUrl: 'http://localhost:8080',
    realm: 'Flyware-Realm',
    publicClient: true,
    credentials: {
        secret: 'eya',
        password: 'eyagafsi1',
    },
};
const keycloak = new Keycloak({ store: memoryStore }, kcConfig);
const app = express();
app.use(cors());
app.use(session({
    secret: 'my-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
}));
app.use(keycloak.middleware());
const PORT = process.env.PORT || 3002;
const eurekaHelper = require('./eureka-helper');
app.listen(PORT, () => {
    console.log("user-server on 3002");
});
eurekaHelper.registerWithEureka('user-server', PORT);
app.use(bodyParser.json());
app.get('/users/:id', keycloak.protect(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const keycloakAdminUrl = 'http://localhost:8080/admin/realms/Flyware-Realm/users/' + userId;
        const accessToken = req.kauth.grant.access_token.token;
        const response = yield axios.get(keycloakAdminUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
}));
