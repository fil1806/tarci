import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import bodyParser from "body-parser";

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.PORT || 3000;
interface NaicsCode {
  code: string;
  name: string;
}
let naicsCodes: NaicsCode[] = [];
let naicsData: any[] = [];

const loadNaicsCodes = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const results: NaicsCode[] = [];
    const filePath = path.resolve(__dirname, "../naics-codes.csv");

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        naicsCodes = results;
        resolve();
      })
      .on("error", (error) => reject(error));
  });
};

// Load companies data from smbs.json
const loadNaicsData = () => {
  const filePath = path.join(__dirname, "../smbs.json");
  try {
    const data = fs.readFileSync(filePath, "utf8");
    naicsData = JSON.parse(data);
  } catch (error) {
    console.error("Error loading NAICS data:", error);
  }
};
loadNaicsData();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/naics-codes", (req: Request, res: Response) => {
  res.json(naicsCodes);
});

app.post("/api/companies", (req: Request, res: Response) => {
  const { naicsCode } = req.body;
  const companies = naicsData
    .filter((company) =>
      company.industries.some((industry: any) => industry.code === naicsCode)
    )
    .map((company) => company.name); // Return only company names
  res.json(companies);
});

loadNaicsCodes()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to load NAICS codes:", error);
  });
