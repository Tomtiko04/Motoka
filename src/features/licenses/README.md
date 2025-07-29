# License Renewal Payment System

This directory contains the license renewal functionality with integrated payment processing.

## Files

### Core Components
- `RenewLicense.jsx` - Main license renewal component
- `newRenew.jsx` - Alternative license renewal component
- `usePayment.js` - React Query hooks for payment operations
- `useRenew.js` - React Query hooks for state/LGA data

### API Services
- `apiPayment.js` - Payment-related API calls
- `apiRenew.js` - Legacy renewal API (deprecated)

## Payment Flow

1. **User selects documents** to renew (Road Worthiness, Vehicle License, etc.)
2. **User fills delivery details** (address, state, LGA, contact)
3. **System validates form** and maps state/LGA names to IDs
4. **Payment initialization** creates payload with:
   ```json
   {
     "car_id": 3,
     "payment_schedule_id": 4,
     "meta_data": {
       "delivery_address": "Ibadan Road",
       "delivery_contact": "08123456789",
       "state_id": 1,
       "lga_id": 70
     }
   }
   ```
5. **API call** to `/payment/initialize` endpoint
6. **Redirect** to payment gateway on success

## Key Features

- **State/LGA Mapping**: Automatically converts state/LGA names to IDs
- **Error Handling**: Displays payment errors to user
- **Loading States**: Shows loading indicators during payment processing
- **Form Validation**: Ensures all required fields are filled
- **Multiple Documents**: Supports selecting multiple documents for renewal

## Usage

```jsx
import { useInitializePayment } from './usePayment';

const { startPayment, isPaymentInitializing, error } = useInitializePayment();

const handlePayNow = () => {
  const payload = {
    car_id: carDetail.id,
    payment_schedule_id: schedule.id,
    meta_data: {
      delivery_address: address,
      delivery_contact: contact,
      state_id: stateId,
      lga_id: lgaId
    }
  };
  
  startPayment(payload);
};
```