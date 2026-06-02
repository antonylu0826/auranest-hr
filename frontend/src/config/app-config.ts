import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

// ⚠️  Fork 後請修改以下所有欄位
export const APP_CONFIG = {
  name: "AuraNest HR",
  version: packageJson.version,
  copyright: `© ${currentYear}, AuraNest HR.`,
  meta: {
    title: "AuraNest HR",
    description: "人力資源管理系統",
  },
};
