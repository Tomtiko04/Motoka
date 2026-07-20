import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import config from '../../config/config';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { CAR_MAKES, getModelsForMake } from '../../Data/carMakesModels';

const CURRENT_YEAR = new Date().getFullYear();

const EMPTY_FORM = {
  name_of_owner: '',
  address: '',
  phone_number: '',
  vehicle_make: '',
  vehicle_model: '',
  vehicle_year: '',
  vehicle_color: '',
  car_type: 'private',
  registration_status: 'unregistered',
  chasis_no: '',
  engine_no: '',
  date_issued: '',
  expiry_date: '',
  plate_number: '',
};

// ─── Field wrapper (defined OUTSIDE the modal so it never gets remounted) ────
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

// ─── Make dropdown with live search ──────────────────────────────────────────
function MakeSelect({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const filtered = query
    ? CAR_MAKES.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : CAR_MAKES;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (make) => {
    onChange(make);
    setQuery('');
    setOpen(false);
  };

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
                    onClick={() => select(make)}
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

// ─── Model dropdown (depends on selected make) ────────────────────────────────
function ModelSelect({ make, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const models = getModelsForMake(make);
  const filtered = query
    ? models.filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    : models;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (model) => { onChange(model); setQuery(''); setOpen(false); };

  // If no known make selected, fall back to free text input
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
        disabled={!make}
        className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
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
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">No matches</li>
            ) : (
              filtered.map((model) => (
                <li key={model}>
                  <button
                    type="button"
                    onClick={() => select(model)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                      value === model ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {model}
                  </button>
                </li>
              ))
            )}
          </ul>
          {/* Allow typing a custom model not in the list */}
          {query && !filtered.includes(query) && (
            <button
              type="button"
              onClick={() => select(query)}
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

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function AddCarModal({ onClose, onSuccess, preselectedUser = null }) {
  const [step, setStep] = useState(preselectedUser ? 2 : 1);

  // User search
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(preselectedUser);
  const searchTimer = useRef(null);

  // Car form
  const [form, setForm] = useState(
    preselectedUser
      ? { ...EMPTY_FORM, name_of_owner: preselectedUser.name || '', phone_number: preselectedUser.phone_number || '' }
      : EMPTY_FORM
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ── User search (debounced 300ms) ──────────────────────────────────────────
  const searchUsers = useCallback(async (q) => {
    if (q.length < 2) { setUserResults([]); return; }
    setUserLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(
        `${config.getApiBaseUrl()}/admin/users/search?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const json = await res.json();
      if (json.status) setUserResults(json.data || []);
    } catch {
      // silent fail
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchUsers(userQuery), 300);
    return () => clearTimeout(searchTimer.current);
  }, [userQuery, searchUsers]);

  // ── Form field setter ──────────────────────────────────────────────────────
  const setField = (field) => (valueOrEvent) => {
    const value = typeof valueOrEvent === 'string' ? valueOrEvent : valueOrEvent.target.value;
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Reset model when make changes
      if (field === 'vehicle_make') next.vehicle_model = '';
      return next;
    });
    setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
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

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('Session expired'); setSubmitting(false); return; }

      const payload = { user_id: selectedUser.id };
      Object.entries(form).forEach(([k, v]) => { if (v !== '') payload[k] = v; });

      const res = await fetch(`${config.getApiBaseUrl()}/admin/cars`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.status) {
        toast.success('Car added successfully');
        onSuccess?.();
        onClose();
      } else {
        toast.error(json.message || 'Failed to add car');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {step === 2 && !preselectedUser && (
              <button
                onClick={() => { setErrors({}); setStep(1); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add Car for User</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 1
                  ? 'Step 1 of 2 — Find the user'
                  : `Step 2 of 2 — Car details for ${selectedUser?.name}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator — hidden when user is preselected */}
        {!preselectedUser && <div className="px-6 pt-3 pb-0">
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 text-xs font-medium ${s <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                    s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s < step ? <CheckCircleIcon className="w-4 h-4" /> : s}
                  </div>
                  {s === 1 ? 'Select User' : 'Car Details'}
                </div>
                {s < 2 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">

          {/* ── STEP 1: User search ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by name, email, or phone number..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {userLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  </div>
                )}
              </div>

              {userQuery.length > 0 && userQuery.length < 2 && (
                <p className="text-xs text-gray-400 text-center py-2">Type at least 2 characters to search</p>
              )}

              {userResults.length > 0 && (
                <div className="space-y-2">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setForm((f) => ({ ...f, name_of_owner: u.name, phone_number: u.phone_number || '' }));
                        setStep(2);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <UserIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{u.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        {u.phone_number && <p className="text-xs text-gray-400">{u.phone_number}</p>}
                      </div>
                      <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                    </button>
                  ))}
                </div>
              )}

              {userQuery.length >= 2 && !userLoading && userResults.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <UserIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No users found for "{userQuery}"</p>
                  <p className="text-xs mt-1">The user must have an account first</p>
                </div>
              )}

              {userQuery.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MagnifyingGlassIcon className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium">Search for a user</p>
                  <p className="text-xs mt-1">Cars will appear in their account immediately</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Car form ── */}
          {step === 2 && (
            <form id="add-car-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Selected user banner */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">{selectedUser?.name}</p>
                  <p className="text-xs text-blue-600">{selectedUser?.email}</p>
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-1">Owner Info</p>
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
                    inputMode="tel"
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
                  <MakeSelect
                    value={form.vehicle_make}
                    onChange={setField('vehicle_make')}
                    error={errors.vehicle_make}
                  />
                </Field>
                <Field label="Model" id="vehicle_model" required error={errors.vehicle_model}>
                  <ModelSelect
                    make={form.vehicle_make}
                    value={form.vehicle_model}
                    onChange={setField('vehicle_model')}
                    error={errors.vehicle_model}
                  />
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
                  <select
                    id="car_type"
                    value={form.car_type}
                    onChange={setField('car_type')}
                    className={inputCls(errors.car_type)}
                  >
                    <option value="private">Private</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </Field>
                <Field label="Registration Status" id="registration_status" required error={errors.registration_status}>
                  <select
                    id="registration_status"
                    value={form.registration_status}
                    onChange={setField('registration_status')}
                    className={inputCls(errors.registration_status)}
                  >
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
          )}
        </div>

        {/* Footer */}
        {step === 2 && (
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
              form="add-car-form"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {submitting && <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />}
              {submitting ? 'Adding...' : 'Add Car'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
