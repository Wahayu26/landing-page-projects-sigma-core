import path from "node:path";
import { fileURLToPath } from "node:url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { id } from "@payloadcms/translations/languages/id";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./src/cms/collections/Media";
import { Insights } from "./src/cms/collections/Insights";
import { Partners } from "./src/cms/collections/Partners";
import { Projects } from "./src/cms/collections/Projects";
import { Solutions } from "./src/cms/collections/Solutions";
import { Users } from "./src/cms/collections/Users";
import { SiteSettings } from "./src/cms/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const usePostgres =
  process.env.PAYLOAD_DB_PROVIDER === "postgres";

const db = usePostgres
  ? postgresAdapter({
      migrationDir: path.resolve(
        dirname,
        "src/cms/migrations/postgres",
      ),

      pool: {
        connectionString:
          process.env.DATABASE_URL ??
          "postgresql://scs:scs@localhost:5432/scs_cms",
      },

      push:
        process.env.PAYLOAD_DB_PUSH === "true",
    })
  : sqliteAdapter({
      client: {
        url:
          process.env.PAYLOAD_SQLITE_URL ??
          "file:./.data/payload.db",
      },

      migrationDir: path.resolve(
        dirname,
        "src/cms/migrations/sqlite",
      ),

      push:
        process.env.PAYLOAD_DB_PUSH === "true",
    });


const emailAdapter = process.env.SMTP_HOST
  ? nodemailerAdapter({
      defaultFromAddress:
        process.env.SMTP_FROM ??
        "admin@sigmacore.id",

      defaultFromName:
        process.env.SMTP_FROM_NAME ??
        "Sigma Core",

      transportOptions: {
        host: process.env.SMTP_HOST,

        port: Number(
          process.env.SMTP_PORT ?? 587,
        ),

        secure:
          process.env.SMTP_SECURE === "true",

        auth:
          process.env.SMTP_USER &&
          process.env.SMTP_PASSWORD
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
              }
            : undefined,
      },
    })
  : undefined;


export default buildConfig({
  email: emailAdapter,

  admin: {
    user: Users.slug,

    components: {
      graphics: {
        Icon: "/src/cms/components/AdminIcon",
        Logo: "/src/cms/components/AdminLogo",
      },

      views: {
        dashboard: {
          Component:
            "/src/cms/components/AdminDashboard",
        },

        createFirstUser: {
          Component:
            "/src/cms/components/BrandedCreateFirstUser",
        },
      },
    },

    meta: {
      titleSuffix: "— Sigma Core CMS",
    },
  },

  collections: [
    Users,
    Media,
    Solutions,
    Partners,
    Projects,
    Insights,
  ],

  globals: [
    SiteSettings,
  ],

  db,

  editor: lexicalEditor(),

  i18n: {
    fallbackLanguage: "id",

    supportedLanguages: {
      id,
    },
  },

  secret:
    process.env.PAYLOAD_SECRET ??
    "local-dev-secret-change-before-deploying",

  serverURL:
    process.env.PAYLOAD_SERVER_URL ??
    process.env.NEXT_PUBLIC_SERVER_URL ??
    "http://localhost:3000",

  sharp,

  typescript: {
    outputFile:
      path.resolve(
        dirname,
        "src/payload-types.ts",
      ),
  },
});
