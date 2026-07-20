import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CAR_MAKES, getModelsForMake } from '../../Data/carMakesModels';
import config from '../../config/config';

const CURRENT_YEAR = new Date().getFullYear();

const DOC_CATEGORIES = [
  { value: 'registration_certificate', label: 'Registration Certificate' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'roadworthiness', label: 'Roadworthiness' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'proof_of_ownership', label: 'Proof of Ownership' },
  { value: 'other', label: 'Other' },
];

function Field({ label, id, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function inputCls(hasError) {
  return `w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;
}

function MakeSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const filtered = query
    ? CAR_MAKES.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : CAR_MAKES;

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Select make'}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search make..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <li className="px-3 py-2 text-sm text-gray-400 text-center">No matches</li>
              : filtered.map((make) => (
                <li key={make}>
                  <button
                    type="button"
                    onClick={() => { onChange(make); setQuery(''); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                      value === make ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {make}
                  </button>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
}

function ModelSelect({ make, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const models = getModelsForMake(make);
  const filtered = query ? models.filter((m) => m.toLowerCase().includes(query.toLowerCase())) : models;

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!make || models.length === 0) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter model"
        className={inputCls(error)}
      />
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:ring-2 focus:ring-blue-500 outline-none ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Select model'}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search model..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <li className="px-3 py-2 text-sm text-gray-400 text-center">No matches</li>
              : filtered.map((model) => (
                <li key={model}>
                  <button
                    type="button"
                    onClick={() => { onChange(model); setQuery(''); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                      value === model ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {model}
                  </button>
                </li>
              ))
            }
          </ul>
          {query && !filtered.includes(query) && (
            <button
              type="button"
              onClick={() => { onChange(query); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors"
            >
              Use "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditCarModal({ car, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name_of_owner: car.name_of_owner || '',
    phone_number: car.phone_number || '',
    address: car.address || '',
    vehicle_make: car.vehicle_make || '',
    vehicle_model: car.vehicle_model || '',
    vehicle_year: car.vehicle_year ? String(car.vehicle_year) : '',
    vehicle_color: car.vehicle_color || '',
    car_type: car.car_type || 'private',
    registration_status: car.registration_status || 'unregistered',
    plate_number: car.plate_number || car.registration_no || '',
    chasis_no: car.chasis_no || '',
    engine_no: car.engine_no || '',
    date_issued: car.date_issued ? car.date_issued.split('T')[0] : '',
    expiry_date: car.expiry_date ? car.expiry_date.split('T')[0] : '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (valueOrEvent) => {
    const value = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'vehicle_make') next.vehicle_model = '';
      return next;
    });
    setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name_of_owner.trim()) e.name_of_owner = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.vehicle_make.trim()) e.vehicle_make = 'Required';
    if (!form.vehicle_model.trim()) e.vehicle_model = 'Required';
    if (!form.vehicle_color.trim()) e.vehicle_color = 'Required';
    if (form.vehicle_year) {
      const yr = parseInt(form.vehicle_year, 10);
      if (isNaN(yr) || yr < 1900 || yr > CURRENT_YEAR + 1)
        e.vehicle_year = `Enter a year between 1900 and ${CURRENT_YEAR + 1}`;
    }
    if (form.registration_status === 'registered' && !form.expiry_date)
      e.expiry_date = 'Required for registered vehicles';
    if (form.date_issued && form.expiry_date &&
      new Date(form.expiry_date) <= new Date(form.date_issued))
      e.expiry_date = 'Must be after date issued';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v; });

      const res = await fetch(`${config.getApiBaseUrl()}/admin/cars/${car.slug}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.status) {
        toast.success('Car updated successfully');
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.message || 'Failed to update car');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Car</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {car.vehicle_make} {car.vehicle_model} &bull; {car.registration_no || car.plate_number || car.slug}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          <form id="edit-car-form" onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Owner Name" id="name_of_owner" required error={errors.name_of_owner}>
                <input
                  id="name_of_owner"
                  value={form.name_of_owner}
                  onChange={setField('name_of_owner')}
                  className={inputCls(errors.name_of_owner)}
                  placeholder="Full name on registration"
                  maxLength={100}
                />
              </Field>
              <Field label="Phone Number" id="phone_number" error={errors.phone_number}>
                <input
                  id="phone_number"
                  value={form.phone_number}
                  onChange={setField('phone_number')}
                  className={inputCls(errors.phone_number)}
                  placeholder="e.g. 08012345678"
                  maxLength={20}
                />
              </Field>
            </div>
            <Field label="Address" id="address" required error={errors.address}>
              <textarea
                id="address"
                value={form.address}
                onChange={setField('address')}
                rows={2}
                className={inputCls(errors.address)}
                placeholder="Residential or business address"
                maxLength={500}
              />
            </Field>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Vehicle Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Make" id="vehicle_make" required error={errors.vehicle_make}>
                <MakeSelect value={form.vehicle_make} onChange={setField('vehicle_make')} error={errors.vehicle_make} />
              </Field>
              <Field label="Model" id="vehicle_model" required error={errors.vehicle_model}>
                <ModelSelect make={form.vehicle_make} value={form.vehicle_model} onChange={setField('vehicle_model')} error={errors.vehicle_model} />
              </Field>
              <Field label="Year" id="vehicle_year" error={errors.vehicle_year}>
                <input
                  id="vehicle_year"
                  type="number"
                  value={form.vehicle_year}
                  onChange={setField('vehicle_year')}
                  className={inputCls(errors.vehicle_year)}
                  placeholder={`e.g. ${CURRENT_YEAR}`}
                  min="1900"
                  max={CURRENT_YEAR + 1}
                />
              </Field>
              <Field label="Color" id="vehicle_color" required error={errors.vehicle_color}>
                <input
                  id="vehicle_color"
                  value={form.vehicle_color}
                  onChange={setField('vehicle_color')}
                  className={inputCls(errors.vehicle_color)}
                  placeholder="e.g. Silver"
                  maxLength={30}
                />
              </Field>
              <Field label="Car Type" id="car_type" required error={errors.car_type}>
                <select id="car_type" value={form.car_type} onChange={setField('car_type')} className={inputCls(errors.car_type)}>
                  <option value="private">Private</option>
                  <option value="commercial">Commercial</option>
                </select>
              </Field>
              <Field label="Registration Status" id="registration_status" required error={errors.registration_status}>
                <select id="registration_status" value={form.registration_status} onChange={setField('registration_status')} className={inputCls(errors.registration_status)}>
                  <option value="unregistered">Unregistered</option>
                  <option value="registered">Registered</option>
                </select>
              </Field>
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">
              Registration Documents
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Plate Number" id="plate_number" error={errors.plate_number}>
                <input
                  id="plate_number"
                  value={form.plate_number}
                  onChange={(e) => setField('plate_number')(e.target.value.toUpperCase())}
                  className={`${inputCls(errors.plate_number)} uppercase`}
                  placeholder="e.g. ABC-123DE"
                  maxLength={20}
                />
              </Field>
              <Field label="Chassis No." id="chasis_no" error={errors.chasis_no}>
                <input
                  id="chasis_no"
                  value={form.chasis_no}
                  onChange={(e) => setField('chasis_no')(e.target.value.toUpperCase())}
                  className={`${inputCls(errors.chasis_no)} uppercase`}
                  placeholder="VIN / Chassis number"
                  maxLength={30}
                />
              </Field>
              <Field label="Engine No." id="engine_no" error={errors.engine_no}>
                <input
                  id="engine_no"
                  value={form.engine_no}
                  onChange={(e) => setField('engine_no')(e.target.value.toUpperCase())}
                  className={`${inputCls(errors.engine_no)} uppercase`}
                  placeholder="Engine number"
                  maxLength={30}
                />
              </Field>
              <Field label="Date Issued" id="date_issued" error={errors.date_issued}>
                <input
                  id="date_issued"
                  type="date"
                  value={form.date_issued}
                  onChange={setField('date_issued')}
                  className={inputCls(errors.date_issued)}
                />
              </Field>
              <Field
                label="Expiry Date"
                id="expiry_date"
                required={form.registration_status === 'registered'}
                error={errors.expiry_date}
                hint={form.registration_status === 'registered' ? 'Required for registered vehicles' : ''}
              >
                <input
                  id="expiry_date"
                  type="date"
                  value={form.expiry_date}
                  onChange={setField('expiry_date')}
                  className={inputCls(errors.expiry_date)}
                />
              </Field>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-car-form"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {submitting && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
