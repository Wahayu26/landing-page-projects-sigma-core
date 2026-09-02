import type { CollectionConfig } from "payload";

import { authenticated } from "../access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Pengguna",
    plural: "Pengguna",
  },
  auth: true,
  admin: {
    group: "Administrasi",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Nama lengkap",
    },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      required: true,
      label: "Peran",
      options: [
        { label: "Administrator", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
    },
  ],
};
