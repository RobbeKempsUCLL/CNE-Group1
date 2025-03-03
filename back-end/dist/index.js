"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const http = __importStar(require("http"));
const cors = require("cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const dbUri = process.env.DB_URI;
const corsOptions = {
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express_1.default.json());
if (!process.env.DB_URI) {
    throw new Error('DB_URI environment variable not set');
}
mongoose_1.default.connect(dbUri).then(() => {
    console.log('Connected to the database');
}).catch((error) => {
    console.error('Error connecting to the database', error);
});
const server = http.createServer(app);
server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
app.get("/", (req, res) => {
    res.send("Backend is running!");
});
