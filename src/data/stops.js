// Demo coordinates around Mumbai. The later backend will turn these positions
// into road travel times via OSRM before asking OR-Tools to optimize the order.
export const initialStops = [
  { id: 'depot', name: 'Main depot', address: 'Chembur East, Mumbai', latitude: 19.0619, longitude: 72.8995, type: 'depot' },
  { id: 'stop-1', name: 'Stop 1', address: 'Chembur Colony, Mumbai', latitude: 19.0549, longitude: 72.8932 },
  { id: 'stop-2', name: 'Stop 2', address: 'Chembur Naka, Mumbai', latitude: 19.0523, longitude: 72.9007 },
  { id: 'stop-3', name: 'Stop 3', address: 'Tilak Nagar, Chembur', latitude: 19.0663, longitude: 72.8971 },
  { id: 'stop-4', name: 'Stop 4', address: 'Kurla East, Mumbai', latitude: 19.0748, longitude: 72.8797 },
  { id: 'stop-5', name: 'Stop 5', address: 'Nehru Nagar, Kurla', latitude: 19.0692, longitude: 72.8781 },
  { id: 'stop-6', name: 'Stop 6', address: 'Kurla West, Mumbai', latitude: 19.0726, longitude: 72.8851 },
  { id: 'stop-7', name: 'Stop 7', address: 'Ghatkopar East, Mumbai', latitude: 19.0834, longitude: 72.9082 },
  { id: 'stop-8', name: 'Stop 8', address: 'Garodia Nagar, Ghatkopar', latitude: 19.0801, longitude: 72.9127 },
  { id: 'stop-9', name: 'Stop 9', address: 'Ghatkopar West, Mumbai', latitude: 19.0871, longitude: 72.9007 },
  { id: 'stop-10', name: 'Stop 10', address: 'Vidyavihar, Mumbai', latitude: 19.0794, longitude: 72.8952 },
]
