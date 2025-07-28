import CarDocuments from "../pages/CarDocuments";

const userData = [
  {
    id: 1,
    name: "Samuel Aderogba",
    username: "samzy",
    email: "aderogbasamueladeolu@gmail.com",
    profileImage: "",
    isRenew: true,
    carDetails: [
      {
        id: 1,
        vehicle_make: "Mercedes-Benz",
        vehicle_model: "Mercedes-Benz",
        year: 2020,
        color: "Blue",
        plate_number: "ABC123",
        expiry_date: "2026-12-31",
      },
      {
        id: 2,
        make: "Honda",
        model: "Civic",
        year: 2019,
        color: "Red",
        plate_number: "XYZ5678",
      },
    ],
    CarDocuments: [
      {
        title: "Vehicle License",
        documentImage:
          "/assets/images/6fe45ed589cd8efebdda471557ad5d41b9a94c27.png",
      },
      {
        title: "Road Worthiness",
        documentImage:
          "/assets/images/052ff265aad5faf623af5bf39cc0e610d17a8ae1.png",
      },
    ],
  },
];
export default userData;
