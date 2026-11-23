import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('AVAILABLE');
  const collectionRef = useRef(null);

  const [selectedCar, setSelectedCar] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [paperworkSubmitted, setPaperworkSubmitted] = useState(false);
  const [paperworkForm, setPaperworkForm] = useState({
    fullName: '',
    phone: '',
    licenseOrId: '',
    address: '',
    paymentMethod: 'Bank Transfer',
    rentalDays: 3,
    pickupDate: '',
    agreedToTerms: false,
  });

  const [testDriveForm, setTestDriveForm] = useState({
    carId: '',
    fullName: '',
    phone: '',
    email: '',
    preferredDate: '',
    preferredTime: '10:00 AM',
  });
  const [testDriveSuccess, setTestDriveSuccess] = useState(false);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/cars/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('Django /api/cars/ response:', data);
      const list = Array.isArray(data) ? data : data.results || [];
      setCars(list);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(
        `Could not load cars from ${API_BASE}/api/cars/ (${err.message}). Make sure Django is running and CORS is enabled.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const getCarImage = (car) => {
    const raw = car.image_url || car.image || car.photo || '';
    if (!raw) return '/cars/placeholder.jpg';
    if (raw.startsWith('http') || raw.startsWith('/cars/')) return raw;
    return `${API_BASE}${raw.startsWith('/') ? '' : '/'}${raw}`;
  };

  const scrollToCollection = () => {
    collectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const openModal = (car, type) => {
    setSelectedCar(car);
    setActionType(type);
    setPaperworkSubmitted(false);
    setPaperworkForm({
      fullName: '',
      phone: '',
      licenseOrId: '',
      address: '',
      paymentMethod: 'Bank Transfer',
      rentalDays: 3,
      pickupDate: '',
      agreedToTerms: false,
    });
  };

  const closeModal = () => {
    setSelectedCar(null);
    setActionType(null);
  };

  const handlePaperworkSubmit = async (e) => {
    e.preventDefault();
    const newStatus = actionType === 'BUY' ? 'SOLD' : 'RENTED';

    try {
      await fetch(`${API_BASE}/api/cars/${selectedCar.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Backend update failed:', err);
    }

    setCars((prev) =>
      prev.map((c) => (c.id === selectedCar.id ? { ...c, status: newStatus } : c))
    );
    setPaperworkSubmitted(true);
  };

  const handleTestDriveSubmit = (e) => {
    e.preventDefault();
    setTestDriveSuccess(true);
    setTimeout(() => {
      setTestDriveSuccess(false);
      setTestDriveForm({
        carId: '',
        fullName: '',
        phone: '',
        email: '',
        preferredDate: '',
        preferredTime: '10:00 AM',
      });
    }, 4000);
  };

  const filteredCars = cars.filter((car) => {
    if (filter === 'ALL') return true;
    return String(car.status || '').toUpperCase() === filter;
  });

  const availableCars = cars.filter(
    (c) => String(c.status || '').toUpperCase() === 'AVAILABLE'
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. WELCOME HERO SEGMENT */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            AutoDrive Dealership
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
            Find the Right Car to Own or Drive Today
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            Explore our live dealership inventory, complete purchase or rental paperwork online, or book a test drive.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={scrollToCollection}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-7 py-3.5 rounded-xl transition cursor-pointer"
            >
              Explore Collection
            </button>
            <a
              href="#test-drive"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-7 py-3.5 rounded-xl transition"
            >
              Register Test Drive
            </a>
          </div>
        </div>
      </header>

      {/* 2. CAR COLLECTION FROM DATABASE */}
      <main ref={collectionRef} className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Our Vehicle Collection</h2>
            <p className="text-sm text-slate-600 mt-1">
              Live vehicles from our dealership database
            </p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <option value="AVAILABLE">Available Stock</option>
            <option value="ALL">All Vehicles</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
          </select>
        </div>

        {loading && (
          <p className="text-center text-slate-500 py-12">Loading vehicles from database...</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {!loading && !error && filteredCars.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
            No vehicles found for this filter. Try switching the dropdown to{' '}
            <button
              onClick={() => setFilter('ALL')}
              className="text-blue-600 font-semibold underline cursor-pointer"
            >
              All Vehicles
            </button>
            .
          </div>
        )}

        {!loading && !error && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const statusUpper = String(car.status || 'AVAILABLE').toUpperCase();
              const isAvailable = statusUpper === 'AVAILABLE';

              return (
                <div
                  key={car.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img
                        src={getCarImage(car)}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {statusUpper}
                      </span>
                      {car.condition && (
                        <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-md bg-white/90 text-slate-700 uppercase">
                          {car.condition}
                        </span>
                      )}
                    </div>

                    <div className="p-6 text-center">
                      <h3 className="text-xl font-bold text-slate-900">
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">VIN: {car.vin}</p>

                      <div className="space-y-1.5 text-sm text-slate-700 border-t border-slate-100 mt-4 pt-4">
                        <p>
                          <strong className="text-slate-900">Color:</strong> {car.color}
                        </p>
                        <p>
                          <strong className="text-slate-900">Mileage:</strong>{' '}
                          {Number(car.mileage).toLocaleString()} km
                        </p>
                        <p>
                          <strong className="text-slate-900">Buy Price:</strong> $
                          {Number(car.buy_price).toLocaleString()}
                        </p>
                        <p>
                          <strong className="text-slate-900">Rent Rate:</strong> ${car.rent_rate} / day
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 px-6 pb-6">
                    <button
                      disabled={!isAvailable}
                      onClick={() => openModal(car, 'BUY')}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      Buy Car
                    </button>
                    <button
                      disabled={!isAvailable}
                      onClick={() => openModal(car, 'RENT')}
                      className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-medium py-2.5 rounded-lg transition cursor-pointer disabled:cursor-not-allowed"
                    >
                      Rent Car
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. TEST DRIVE REGISTRATION SECTION */}
      <section id="test-drive" className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Register for a Test Drive
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Choose an available car from our inventory and book your time slot.
            </p>
          </div>

          {testDriveSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-6 text-center font-semibold">
              Test Drive Registered! We will contact you shortly to confirm.
            </div>
          ) : (
            <form
              onSubmit={handleTestDriveSubmit}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Vehicle
                  </label>
                  <select
                    required
                    value={testDriveForm.carId}
                    onChange={(e) => setTestDriveForm({ ...testDriveForm, carId: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2.5 text-sm"
                  >
                    <option value="">-- Select an available car --</option>
                    {availableCars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model} ({car.color})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={testDriveForm.fullName}
                    onChange={(e) => setTestDriveForm({ ...testDriveForm, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={testDriveForm.phone}
                    onChange={(e) => setTestDriveForm({ ...testDriveForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={testDriveForm.preferredDate}
                    onChange={(e) =>
                      setTestDriveForm({ ...testDriveForm, preferredDate: e.target.value })
                    }
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition cursor-pointer"
              >
                Confirm Test Drive Booking
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 4. PURCHASE / RENTAL PAPERWORK MODAL */}
      {selectedCar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
              <div>
                <span className="text-xs font-bold uppercase text-blue-600">
                  {actionType === 'BUY' ? 'Purchase Paperwork' : 'Rental Agreement'}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  {selectedCar.year} {selectedCar.make} {selectedCar.model}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {paperworkSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <h4 className="text-lg font-bold text-emerald-700">Paperwork Submitted!</h4>
                <p className="text-sm text-slate-600">
                  The {selectedCar.year} {selectedCar.make} {selectedCar.model} has been marked as{' '}
                  <strong>{actionType === 'BUY' ? 'SOLD' : 'RENTED'}</strong>.
                </p>
                <button
                  onClick={closeModal}
                  className="bg-slate-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaperworkSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={paperworkForm.fullName}
                    onChange={(e) => setPaperworkForm({ ...paperworkForm, fullName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      ID / License #
                    </label>
                    <input
                      type="text"
                      required
                      value={paperworkForm.licenseOrId}
                      onChange={(e) =>
                        setPaperworkForm({ ...paperworkForm, licenseOrId: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={paperworkForm.phone}
                      onChange={(e) => setPaperworkForm({ ...paperworkForm, phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={paperworkForm.address}
                    onChange={(e) => setPaperworkForm({ ...paperworkForm, address: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                {actionType === 'BUY' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paperworkForm.paymentMethod}
                      onChange={(e) =>
                        setPaperworkForm({ ...paperworkForm, paymentMethod: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option>Bank Transfer</option>
                      <option>Cash at Dealership</option>
                      <option>Dealership Financing</option>
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Pickup Date
                      </label>
                      <input
                        type="date"
                        required
                        value={paperworkForm.pickupDate}
                        onChange={(e) =>
                          setPaperworkForm({ ...paperworkForm, pickupDate: e.target.value })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                        Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={paperworkForm.rentalDays}
                        onChange={(e) =>
                          setPaperworkForm({ ...paperworkForm, rentalDays: Number(e.target.value) })
                        }
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
                <label className="flex items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    required
                    checked={paperworkForm.agreedToTerms}
                    onChange={(e) =>
                      setPaperworkForm({ ...paperworkForm, agreedToTerms: e.target.checked })
                    }
                    className="mt-0.5"
                  />
                  <span>I confirm my details are accurate and agree to the dealership terms.</span>
                </label>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer"
                  >
                    Submit Paperwork
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}