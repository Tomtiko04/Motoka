import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import config from '../../config/config';
import {
  XMarkIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { CAR_MAKES, getModelsForMake } from '../../Data/carMakesModels';

const CURRENT_YEAR = new Date().getFullYear();

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

function MiniMakeSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = React.useRef(null);

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
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
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
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">No matches</li>
            ) : (
              filtered.map((make) => (
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
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function MiniModelSelect({ make, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = React.useRef(null);
  const models = getModelsForMake(make);
  const filtered = query ? models.filter((m) => m.toLowerCase().includes(query.toLowerCase())) : models;

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!make || models.length === 0) {
    return (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Enter model" className={inputCls(error)} />
    );
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        }`}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Select model'}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input autoFocus type="text" placeholder="Search model..." value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">No matches</li>
            ) : (
              filtered.map((model) => (
                <li key={model}>
                  <button type="button" onClick={() => { onChange(model); setQuery(''); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                      value === model ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >{model}</button>
                </li>
              ))
            )}
          </ul>
          {query && !filtered.includes(query) && (
            <button type="button" onClick={() => { onChange(query); setQuery(''); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 transition-colors"
            >Use "{query}"</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddUserModal({ onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [addCar, setAddCar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  });

  const [car, setCar] = useState({
    plate_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    car_type: 'private',
    name_of_owner: '',
    address: '',
  });

  const setUserField = (field) => (e) => {
    const val = typeof e === 'string' ? e : e.target.value;
    setUser((u) => ({ ...u, [field]: val }));
    setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
  };

  const setCarField = (field) => (valueOrEvent) => {
    const val = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target.value;
    setCar((c) => {
      const next = { ...c, [field]: val };
      if (field === 'vehicle_make') next.vehicle_model = '';
      return next;
    });
    setErrors((er) => { const n = { ...er }; delete n[`car_${field}`]; return n; });
  };

  const validateStep1 = () => {
    const e = {};
    if (!user.first_name.trim()) e.first_name = 'Required';
    if (!user.last_name.trim()) e.last_name = 'Required';
    if (!user.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) e.email = 'Invalid email';
    return e;
  };

  const validateStep2 = () => {
    if (!addCar) return {};
    const e = {};
    if (!car.vehicle_make.trim()) e.car_vehicle_make = 'Required';
    if (!car.vehicle_model.trim()) e.car_vehicle_model = 'Required';
    if (!car.vehicle_color.trim()) e.car_vehicle_color = 'Required';
    if (!car.name_of_owner.trim()) e.car_name_of_owner = 'Required';
    if (car.vehicle_year) {
      const yr = parseInt(car.vehicle_year, 10);
      if (isNaN(yr) || yr < 1900 || yr > CURRENT_YEAR + 1) e.car_vehicle_year = 'Invalid year';
    }
    return e;
  };

  const goToStep2 = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setCar((c) => ({
      ...c,
      name_of_owner: c.name_of_owner || `${user.first_name} ${user.last_name}`.trim(),
    }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errs = { ...validateStep1(), ...validateStep2() };
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Session expired'); return; }

      const payload = { ...user };
      if (addCar) {
        const carPayload = {};
        Object.entries(car).forEach(([k, v]) => { if (v !== '') carPayload[k] = v; });
        payload.car = carPayload;
      }

      const res = await fetch(`${config.getApiBaseUrl()}/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.status) {
        setResult(json.data);
        setStep(3);
        onSuccess?.();
      } else {
        toast.error(json.message || 'Failed to create user');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(result?.temporary_password || '');
    toast.success('Password copied');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && step !== 3 && onClose()} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => { setErrors({}); setStep(1); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {step === 3 ? 'User Created' : 'Add New User'}
              </h2>
              {step < 3 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {step === 1 ? 'Step 1 — User details' : 'Step 2 — Add a car (optional)'}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="px-6 pt-3 pb-0">
            <div className="flex items-center gap-2">
              {[1, 2].map((s) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                      s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {s < step ? <CheckCircleIcon className="w-4 h-4" /> : s}
                    </div>
                    {s === 1 ? 'User Info' : 'Car (Optional)'}
                  </div>
                  {s < 2 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* STEP 1: User info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" id="first_name" required error={errors.first_name}>
                  <input id="first_name" value={user.first_name} onChange={setUserField('first_name')}
                    className={inputCls(errors.first_name)} placeholder="John" maxLength={100} autoFocus />
                </Field>
                <Field label="Last Name" id="last_name" required error={errors.last_name}>
                  <input id="last_name" value={user.last_name} onChange={setUserField('last_name')}
                    className={inputCls(errors.last_name)} placeholder="Doe" maxLength={100} />
                </Field>
              </div>
              <Field label="Email" id="email" required error={errors.email}>
                <input id="email" type="email" value={user.email} onChange={setUserField('email')}
                  className={inputCls(errors.email)} placeholder="john@example.com" maxLength={200} />
              </Field>
              <Field label="Phone Number" id="phone_number" error={errors.phone_number}
                hint="Optional — user can add later">
                <input id="phone_number" value={user.phone_number} onChange={setUserField('phone_number')}
                  className={inputCls(errors.phone_number)} placeholder="e.g. 08012345678"
                  maxLength={20} inputMode="tel" />
              </Field>
            </div>
          )}

          {/* STEP 2: Optional car */}
          {step === 2 && (
            <form id="add-user-form" onSubmit={handleSubmit} className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                <input type="checkbox" checked={addCar} onChange={(e) => setAddCar(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Also add a car for this user</p>
                  <p className="text-xs text-gray-500">You can always add cars later from the user's profile</p>
                </div>
              </label>

              {addCar && (
                <div className="space-y-4 pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Info</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Owner Name" id="car_name_of_owner" required error={errors.car_name_of_owner}>
                      <input value={car.name_of_owner} onChange={setCarField('name_of_owner')}
                        className={inputCls(errors.car_name_of_owner)} placeholder="Full name on registration" maxLength={100} />
                    </Field>
                    <Field label="Address" id="car_address" error={errors.car_address}>
                      <input value={car.address} onChange={setCarField('address')}
                        className={inputCls(errors.car_address)} placeholder="Address" maxLength={500} />
                    </Field>
                  </div>

                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Vehicle Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Make" id="car_vehicle_make" required error={errors.car_vehicle_make}>
                      <MiniMakeSelect value={car.vehicle_make} onChange={setCarField('vehicle_make')} error={errors.car_vehicle_make} />
                    </Field>
                    <Field label="Model" id="car_vehicle_model" required error={errors.car_vehicle_model}>
                      <MiniModelSelect make={car.vehicle_make} value={car.vehicle_model} onChange={setCarField('vehicle_model')} error={errors.car_vehicle_model} />
                    </Field>
                    <Field label="Year" id="car_vehicle_year" error={errors.car_vehicle_year}>
                      <input type="number" value={car.vehicle_year} onChange={setCarField('vehicle_year')}
                        className={inputCls(errors.car_vehicle_year)} placeholder={`e.g. ${CURRENT_YEAR}`}
                        min="1900" max={CURRENT_YEAR + 1} />
                    </Field>
                    <Field label="Color" id="car_vehicle_color" required error={errors.car_vehicle_color}>
                      <input value={car.vehicle_color} onChange={setCarField('vehicle_color')}
                        className={inputCls(errors.car_vehicle_color)} placeholder="e.g. Silver" maxLength={30} />
                    </Field>
                    <Field label="Plate Number" id="car_plate_number" error={errors.car_plate_number}>
                      <input value={car.plate_number}
                        onChange={(e) => setCarField('plate_number')(e.target.value.toUpperCase())}
                        className={`${inputCls(errors.car_plate_number)} uppercase`}
                        placeholder="e.g. ABC-123DE" maxLength={20} />
                    </Field>
                    <Field label="Car Type" id="car_car_type">
                      <select value={car.car_type} onChange={setCarField('car_type')} className={inputCls(false)}>
                        <option value="private">Private</option>
                        <option value="commercial">Commercial</option>
                      </select>
                    </Field>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* STEP 3: Success */}
          {step === 3 && result && (
            <div className="text-center space-y-5 py-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{result.user?.name}</h3>
                <p className="text-sm text-gray-500">{result.user?.email}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-amber-800 mb-2">Temporary Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm font-mono text-amber-900 select-all">
                    {result.temporary_password}
                  </code>
                  <button onClick={copyPassword}
                    className="p-2 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors" title="Copy">
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2">Share this with the user. They should change it after first login.</p>
              </div>

              {result.car && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Car Added</p>
                  <p className="text-sm text-blue-900">
                    {result.car.vehicle_make} {result.car.vehicle_model}
                    {result.car.plate_number && ` — ${result.car.plate_number}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          {step === 1 && (
            <>
              <button type="button" onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={goToStep2}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button type="button" onClick={onClose} disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="add-user-form" disabled={submitting}
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                {submitting && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
                {submitting ? 'Creating...' : addCar ? 'Create User & Car' : 'Create User'}
              </button>
            </>
          )}
          {step === 3 && (
            <button type="button" onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
