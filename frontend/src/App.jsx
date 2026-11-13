import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://127.0.0.1:8000/api';

function App() {
  const [cars, setCars] = useState([]);
  const [filterStatus, setFilterStatus] = useState('available');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCar, setSelectedCar] = useState(null);
  const [actionType, setActionType] = useState('BUY');

  const [customerId, setCustomerId] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');
  const [customerForm, setCustomerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API_BASE}/cars/`);
      setCars(res.data);
    } catch (err) {
      console.error('Error fetching cars:', err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleSelectCar = (car, type) => {
    setSelectedCar(car);
    setActionType(type);
    setReceipt(null);
    setCustomerId(null);
    setIsReturning(false);
    setLookupMessage('');
    setStartDate('');
    setEndDate('');
    setCustomerForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const handleCustomerLookup = async () => {
    if (!customerForm.email) return;
    try {
      const res = await axios.get(`${API_BASE}/customers/lookup/?email=${customerForm.email}`);
      setCustomerId(res.data.customer_id);
      setCustomerForm({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        email: res.data.email,
        phone: res.data.phone,
        address: res.data.address,
      });
      setIsReturning(true);
      setLookupMessage('Welcome back! Your saved details have been filled automatically.');
    } catch (err) {
      setCustomerId(null);
      setIsReturning(false);
      setLookupMessage('New customer — please fill in your details below.');
    }
  };

  const calculateEstimatedBill = () => {
    if (!selectedCar) return 0;
    if (actionType === 'BUY') return parseFloat(selectedCar.price);
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days = Math.max(Math.ceil((end - start) / (1000 * 60 * 60 * 24)), 1);
      return days * parseFloat(selectedCar.rent_price_per_day);
    }
    return parseFloat(selectedCar.rent_price_per_day);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let activeCustomerId = customerId;

      if (!activeCustomerId) {
        const custRes = await axios.post(`${API_BASE}/customers/`, customerForm);
        activeCustomerId = custRes.data.customer_id;
      }

      if (actionType === 'BUY') {
        const saleRes = await axios.post(`${API_BASE}/sales/`, {
          car: selectedCar.vin,
          customer: activeCustomerId,
          payment_method: paymentMethod,
        });
        setReceipt({ type: 'PURCHASE RECEIPT', data: saleRes.data });
      } else {
        const rentRes = await axios.post(`${API_BASE}/rentals/`, {
          car: selectedCar.vin,
          customer: activeCustomerId,
          start_date: startDate,
          end_date: endDate,
          payment_method: paymentMethod,
        });
        setReceipt({ type: 'RENTAL RECEIPT', data: rentRes.data });
      }

      fetchCars();
    } catch (err) {
      alert('Checkout failed. Check console or verify all fields are filled.');
      console.error(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesStatus = filterStatus === 'all' || car.status === filterStatus;
    const matchesSearch = `${car.make} ${car.model} ${car.year}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container">
      <header className="navbar">
        <h1>AutoDrive Dealership</h1>
        <p>Buy or Rent Your Next Vehicle</p>
      </header>

      <div className="controls">
        <input
          type="text"
          placeholder="Search make, model, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="available">Available Stock</option>
          <option value="all">All Vehicles</option>
          <option value="rented">Rented</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div className="car-grid">
        {filteredCars.map((car) => (
          <div key={car.vin} className="car-card">
            <div className="card-header">
              <span className={`badge ${car.status}`}>{car.status.toUpperCase()}</span>
              <span className="condition">{car.condition.toUpperCase()}</span>
            </div>
            <h3>{car.year} {car.make} {car.model}</h3>
            <p className="vin">VIN: {car.vin}</p>
            <ul className="specs">
              <li><strong>Color:</strong> {car.color}</li>
              <li><strong>Mileage:</strong> {car.mileage.toLocaleString()} km</li>
              <li><strong>Buy Price:</strong> ${Number(car.price).toLocaleString()}</li>
              <li><strong>Rent Rate:</strong> ${Number(car.rent_price_per_day).toLocaleString()} / day</li>
            </ul>

            {car.status === 'available' ? (
              <div className="card-actions">
                <button className="btn-buy" onClick={() => handleSelectCar(car, 'BUY')}>
                  Buy Car
                </button>
                <button className="btn-rent" onClick={() => handleSelectCar(car, 'RENT')}>
                  Rent Car
                </button>
              </div>
            ) : (
              <button className="btn-disabled" disabled>
                Unavailable ({car.status})
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedCar && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedCar(null)}>×</button>

            {!receipt ? (
              <form onSubmit={handleCheckout}>
                <h2>{actionType === 'BUY' ? 'Purchase Vehicle' : 'Rent Vehicle'}</h2>
                <p className="selected-summary">
                  {selectedCar.year} {selectedCar.make} {selectedCar.model} (VIN: {selectedCar.vin})
                </p>

                <div className="form-group lookup-group">
                  <label>Email Address (Check if returning customer)</label>
                  <div className="lookup-row">
                    <input
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    />
                    <button type="button" onClick={handleCustomerLookup} className="btn-lookup">
                      Check Email
                    </button>
                  </div>
                  {lookupMessage && <small className="lookup-msg">{lookupMessage}</small>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      required
                      disabled={isReturning}
                      value={customerForm.first_name}
                      onChange={(e) => setCustomerForm({ ...customerForm, first_name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      required
                      disabled={isReturning}
                      value={customerForm.last_name}
                      onChange={(e) => setCustomerForm({ ...customerForm, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    required
                    disabled={isReturning}
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    required
                    disabled={isReturning}
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  />
                </div>

                {actionType === 'RENT' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        required
                        min={startDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="bill-preview">
                  <span>Calculated Total Bill:</span>
                  <strong>${calculateEstimatedBill().toLocaleString()}</strong>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm & Generate Receipt'}
                </button>
              </form>
            ) : (
              <div className="receipt-box">
                <h2>{receipt.type}</h2>
                <hr />
                <p><strong>Receipt ID:</strong> #{receipt.data.sale_id || receipt.data.rental_id}</p>
                <p><strong>Customer:</strong> {receipt.data.customer_details?.first_name} {receipt.data.customer_details?.last_name}</p>
                <p><strong>Email:</strong> {receipt.data.customer_details?.email}</p>
                <p><strong>Phone:</strong> {receipt.data.customer_details?.phone}</p>
                <hr />
                <p><strong>Vehicle:</strong> {receipt.data.car_details?.year} {receipt.data.car_details?.make} {receipt.data.car_details?.model}</p>
                <p><strong>VIN:</strong> {receipt.data.car}</p>
                {receipt.data.start_date && (
                  <p><strong>Rental Period:</strong> {receipt.data.start_date} to {receipt.data.end_date}</p>
                )}
                <p><strong>Payment Method:</strong> {receipt.data.payment_method}</p>
                <div className="receipt-total">
                  Total Paid: ${Number(receipt.data.sale_price || receipt.data.total_cost).toLocaleString()}
                </div>
                <button className="btn-submit" onClick={() => window.print()}>
                  Print Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;