export const PAYMENT_TYPES = {
  DRIVERS_LICENSE: 'drivers_license',
  VEHICLE_PAPER: 'vehicle_paper',
  LICENSE_RENEWAL: 'license_renewal',
};

export const PAYMENT_METHODS = {
  PAYSTACK: 'paystack',
  MONICREDIT: 'monicredit',
  BANK_TRANSFER: 'bank_transfer',
};

export const PAYMENT_CONFIG = {
  [PAYMENT_TYPES.DRIVERS_LICENSE]: {
    label: "Driver's License",
    methods: [PAYMENT_METHODS.PAYSTACK, PAYMENT_METHODS.MONICREDIT],
    requiredFields: ['license_slug', 'amount'],
  },
  [PAYMENT_TYPES.VEHICLE_PAPER]: {
    label: "Vehicle Paper",
    methods: [PAYMENT_METHODS.PAYSTACK, PAYMENT_METHODS.MONICREDIT],
    requiredFields: ['car_slug', 'amount', 'vehicle_details'],
  },
  [PAYMENT_TYPES.LICENSE_RENEWAL]: {
    label: "License Renewal",
    methods: [PAYMENT_METHODS.PAYSTACK, PAYMENT_METHODS.MONICREDIT],
    requiredFields: ['license_id', 'renewal_details'],
  },
};