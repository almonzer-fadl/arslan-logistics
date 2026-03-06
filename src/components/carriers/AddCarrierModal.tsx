"use client";

import { useState } from "react";
import Modal from "../ui/Modal";
import { encryptCredentials } from "@/lib/encryption";

interface AddCarrierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (carrier: any) => void;
}

export default function AddCarrierModal({
  isOpen,
  onClose,
  onAdd,
}: AddCarrierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    scac_code: "",
    website: "",
    portal_url: "",
    username: "",
    password: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Encrypt credentials
    const encryptedCreds = encryptCredentials({
      username: formData.username,
      password: formData.password,
    });

    const newCarrier = {
      name: formData.name,
      scac_code: formData.scac_code,
      website: formData.website,
      dashboard_url: formData.portal_url,
      encrypted_credentials: encryptedCreds,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      sales_rep_name: formData.contact_name,
      status: formData.status,
    };

    onAdd(newCarrier);
    onClose();
    // Reset form
    setFormData({
      name: "",
      scac_code: "",
      website: "",
      portal_url: "",
      username: "",
      password: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      status: "active",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Carrier" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Carrier Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="e.g., Maersk Line"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                SCAC Code
              </span>
              <input
                type="text"
                value={formData.scac_code}
                onChange={(e) =>
                  setFormData({ ...formData, scac_code: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="e.g., MAEU"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Website
              </span>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="https://www.carrier.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Portal URL
              </span>
              <input
                type="url"
                value={formData.portal_url}
                onChange={(e) =>
                  setFormData({ ...formData, portal_url: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="https://portal.carrier.com"
              />
            </label>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Portal Credentials (Encrypted)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Username
              </span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="Portal username"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Password
              </span>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="Portal password"
              />
            </label>
          </div>
          <p className="text-xs text-slate-500">
            <span className="material-symbols-outlined text-[14px] inline-block mr-1 align-text-bottom">lock</span>
            Credentials are encrypted with AES-256 before storage
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Primary Contact</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Contact Name
              </span>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) =>
                  setFormData({ ...formData, contact_name: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="Sales Rep Name"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="contact@carrier.com"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Phone
              </span>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
                placeholder="+1 234 567 8900"
              />
            </label>
          </div>
        </div>

        {/* Status */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Status</span>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-[#137fec] focus:border-[#137fec]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-[#137fec]/90 transition-colors"
          >
            Add Carrier
          </button>
        </div>
      </form>
    </Modal>
  );
}
