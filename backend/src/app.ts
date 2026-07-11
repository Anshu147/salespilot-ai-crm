import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

const app = express();

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "SalesPilot API is running",
    });
});

export default app;