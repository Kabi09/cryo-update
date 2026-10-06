import React, { useState, useEffect } from 'react';
import DoubleBezelCard from '../../components/DoubleBezelCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import PermissionGuard from '../../components/PermissionGuard';
import masterDataApi from '../../services/api/masterDataApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  CorporateFare, 
  PrecisionManufacturing, 
  Category, 
  Storefront, 
  Warehouse, 
  SettingsSuggest, 
  Add, 
  Edit 
} from '@mui/icons-material';

const MasterDataPage = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('customers'); // customers | products | materials | vendors | warehouses | configs

  // Data states
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Forms
  const [customerForm, setCustomerForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    creditLimit: 5000000
  });

  const [productForm, setProductForm] = useState({
    name: '',
    modelNumber: '',
    standardPrice: 450000,
    category: 'ULT_FREEZER',
    description: ''
  });

  const [materialForm, setMaterialForm] = useState({
    name: '',
    unitOfMeasure: 'PCS',
    itemCode: '',
    category: 'REFRIGERATION',
    standardCost: 15000,
    reorderPoint: 5
  });

  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    paymentTermsDays: 30
  });

  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    location: ''
  });

  const [configForm, setConfigForm] = useState({
    key: 'MAX_DISCOUNT_PERCENT',
    value: '15'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, mRes, vRes, wRes, cfgRes] = await Promise.all([
        masterDataApi.getCustomers({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getProducts({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getMaterials({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getVendors({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getWarehouses({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getConfigurations().catch(() => ({ data: { data: [] } }))
      ]);

      const getData = (res) => (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));

      setCustomers(getData(cRes));
      setProducts(getData(pRes));
      setMaterials(getData(mRes));
      setVendors(getData(vRes));
      setWarehouses(getData(wRes));
      setConfigs(getData(cfgRes));
    } catch (err) {
      showError(err.message || 'Failed to load master registries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.createCustomer(customerForm);
      showSuccess('Customer registered into master registry.');
      setIsCustomerModalOpen(false);
      setCustomerForm({ companyName: '', contactPerson: '', email: '', phone: '', gstin: '', creditLimit: 5000000 });
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating customer');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.createProduct(productForm);
      showSuccess('Product registered into catalog.');
      setIsProductModalOpen(false);
      setProductForm({ name: '', modelNumber: '', standardPrice: 450000, category: 'ULT_FREEZER', description: '' });
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating product');
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.createMaterial(materialForm);
      showSuccess('Material catalog item created.');
      setIsMaterialModalOpen(false);
      setMaterialForm({ name: '', unitOfMeasure: 'PCS', itemCode: '', category: 'REFRIGERATION', standardCost: 15000, reorderPoint: 5 });
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating material');
    }
  };

  const handleCreateVendor = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.createVendor(vendorForm);
      showSuccess('Vendor partner registered.');
      setIsVendorModalOpen(false);
      setVendorForm({ name: '', contactPerson: '', email: '', phone: '', gstin: '', paymentTermsDays: 30 });
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating vendor');
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.createWarehouse(warehouseForm);
      showSuccess('Warehouse depot configured.');
      setIsWarehouseModalOpen(false);
      setWarehouseForm({ code: '', name: '', location: '' });
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating warehouse');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      await masterDataApi.updateConfiguration(configForm);
      showSuccess('Business rule updated.');
      setIsConfigModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error saving rule');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cryo)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            <CorporateFare style={{ fontSize: '1.1rem' }} /> Enterprise Master Architecture
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Master Data & Governance Configuration
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Central single-source-of-truth catalogs for Customers, Products, Raw Materials, Vendors, and Business Rules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <PermissionGuard permission="MASTER_MANAGE">
            {activeTab === 'customers' && (
              <button className="btn btn-primary" onClick={() => setIsCustomerModalOpen(true)}>
                <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Add Customer
              </button>
            )}
            {activeTab === 'products' && (
              <button className="btn btn-primary" onClick={() => setIsProductModalOpen(true)}>
                <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Add Product
              </button>
            )}
            {activeTab === 'materials' && (
              <button className="btn btn-primary" onClick={() => setIsMaterialModalOpen(true)}>
                <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Add Material
              </button>
            )}
            {activeTab === 'vendors' && (
              <button className="btn btn-primary" onClick={() => setIsVendorModalOpen(true)}>
                <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Add Vendor
              </button>
            )}
            {activeTab === 'warehouses' && (
              <button className="btn btn-primary" onClick={() => setIsWarehouseModalOpen(true)}>
                <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Add Warehouse
              </button>
            )}
            {activeTab === 'configs' && (
              <button className="btn btn-primary" onClick={() => setIsConfigModalOpen(true)}>
                <SettingsSuggest style={{ fontSize: '1rem', marginRight: '6px' }} /> Update Rule
              </button>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px', overflowX: 'auto' }}>
        {[
          { id: 'customers', label: 'Customers Directory', icon: CorporateFare, count: customers.length },
          { id: 'products', label: 'Product Catalog', icon: PrecisionManufacturing, count: products.length },
          { id: 'materials', label: 'Raw Materials & Spares', icon: Category, count: materials.length },
          { id: 'vendors', label: 'Approved Vendors', icon: Storefront, count: vendors.length },
          { id: 'warehouses', label: 'Warehouses & Depots', icon: Warehouse, count: warehouses.length },
          { id: 'configs', label: 'Configurable Rules', icon: SettingsSuggest, count: configs.length }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 16px',
                cursor: 'pointer',
                color: activeTab === tab.id ? 'var(--accent-cryo)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-cryo)' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon style={{ fontSize: '1rem' }} />
              {tab.label}
              <span style={{
                background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'customers' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Verified Customer Master</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'companyName',
                  header: 'Company / Organization',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.companyName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GSTIN: {row.gstin || 'GSTIN-PENDING'}</div>
                    </div>
                  )
                },
                {
                  key: 'contact',
                  header: 'Primary Contact Person',
                  render: (row) => (
                    <div>
                      <div>{row.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email} | {row.phone}</div>
                    </div>
                  )
                },
                {
                  key: 'creditLimit',
                  header: 'Commercial Credit Limit',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cryo)' }}>
                      ₹{row.creditLimit?.toLocaleString('en-IN') || '50,00,000'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
                }
              ]}
              data={customers}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'products' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Cryogenic Product Master Catalog</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'modelNumber',
                  header: 'Model Number',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.modelNumber}
                    </span>
                  )
                },
                {
                  key: 'name',
                  header: 'Product Designation',
                  render: (row) => row.name
                },
                {
                  key: 'category',
                  header: 'Thermal Class',
                  render: (row) => (
                    <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontFamily: 'var(--font-mono)' }}>
                      {row.category || 'ULT_FREEZER'}
                    </span>
                  )
                },
                {
                  key: 'price',
                  header: 'Standard Base Price',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                      ₹{row.standardPrice?.toLocaleString('en-IN')}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Catalog Status',
                  render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
                }
              ]}
              data={products}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'materials' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Raw Materials, Components & Spares Master</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'itemCode',
                  header: 'Item Code',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.itemCode || row._id.slice(-6).toUpperCase()}
                    </span>
                  )
                },
                {
                  key: 'name',
                  header: 'Material Description',
                  render: (row) => row.name
                },
                {
                  key: 'uom',
                  header: 'UoM',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{row.unitOfMeasure}</span>
                  )
                },
                {
                  key: 'cost',
                  header: 'Standard Cost',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      ₹{row.standardCost?.toLocaleString('en-IN') || '0'}
                    </span>
                  )
                },
                {
                  key: 'reorderPoint',
                  header: 'Reorder Buffer',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)', fontWeight: 600 }}>
                      {row.reorderPoint || 5} {row.unitOfMeasure}
                    </span>
                  )
                }
              ]}
              data={materials}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'vendors' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Approved Vendor List (AVL)</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'name',
                  header: 'Vendor Firm',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{row.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GST: {row.gstin || 'N/A'}</div>
                    </div>
                  )
                },
                {
                  key: 'contact',
                  header: 'Key Contact Person',
                  render: (row) => (
                    <div>
                      <div>{row.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email} | {row.phone}</div>
                    </div>
                  )
                },
                {
                  key: 'rating',
                  header: 'Quality Audit Rating',
                  render: (row) => (
                    <span style={{ color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.rating || 4.8} / 5.0 ★
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Approval State',
                  render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
                }
              ]}
              data={vendors}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'warehouses' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Storage Depots & Work Centers</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'code',
                  header: 'Location Code',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.code}
                    </span>
                  )
                },
                {
                  key: 'name',
                  header: 'Warehouse Facility',
                  render: (row) => row.name
                },
                {
                  key: 'location',
                  header: 'Physical Location',
                  render: (row) => row.location || 'Ambattur Industrial Estate, Chennai'
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (row) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {row.isDefault ? 'Default Hub' : 'Regional Facility'}
                    </span>
                  )
                }
              ]}
              data={warehouses}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'configs' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Configurable Business Rules Engine</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-cryo)', fontFamily: 'var(--font-mono)' }}>SALES_GOVERNANCE</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}>Discount Authority Limit</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Maximum discount salesperson can grant without Managing Director sign-off: <strong>15.0%</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>FINANCE_SECURITY</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}>Advance Release Threshold</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Production order release requires verified advance payment of at least: <strong>30.0%</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>QUALITY_STANDARD</div>
                <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '4px' }}>Pull-Down Hold Duration</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Mandatory continuous stabilization hold time at -80°C before QA pass: <strong>4.0 Hours</strong>
                </div>
              </div>
            </div>
          </div>
        </DoubleBezelCard>
      )}

      {/* CUSTOMER MODAL */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Register New Customer"
        subtitle="Add commercial partner to master database"
      >
        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Company Name *</label>
            <input
              type="text"
              className="form-control"
              value={customerForm.companyName}
              onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Contact Person *</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.contactPerson}
                onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input
                type="text"
                className="form-control"
                value={customerForm.gstin}
                onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCustomerModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Customer Record</button>
          </div>
        </form>
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Add Product Specification"
        subtitle="Define new unit model in the catalog"
      >
        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Product Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Ultra-Low Freezer (-86°C Single Door)"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Model Number *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CRYO-ULT-800"
                value={productForm.modelNumber}
                onChange={(e) => setProductForm({ ...productForm, modelNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Base Price (INR) *</label>
              <input
                type="number"
                className="form-control"
                value={productForm.standardPrice}
                onChange={(e) => setProductForm({ ...productForm, standardPrice: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsProductModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product Model</button>
          </div>
        </form>
      </Modal>

      {/* MATERIAL MODAL */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Add Material / Component"
        subtitle="Catalog raw material for BOM and inventory"
      >
        <form onSubmit={handleCreateMaterial} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Material Description *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Embraco Hermetic Compressor 1.5HP"
              value={materialForm.name}
              onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Unit of Measure (UoM) *</label>
              <input
                type="text"
                className="form-control"
                value={materialForm.unitOfMeasure}
                onChange={(e) => setMaterialForm({ ...materialForm, unitOfMeasure: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Standard Cost (INR)</label>
              <input
                type="number"
                className="form-control"
                value={materialForm.standardCost}
                onChange={(e) => setMaterialForm({ ...materialForm, standardCost: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsMaterialModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Material</button>
          </div>
        </form>
      </Modal>

      {/* VENDOR MODAL */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title="Register Approved Vendor"
        subtitle="Onboard supplier for procurement purchase orders"
      >
        <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Vendor Organization *</label>
            <input
              type="text"
              className="form-control"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Contact Person *</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="form-control"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">GSTIN</label>
              <input
                type="text"
                className="form-control"
                value={vendorForm.gstin}
                onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsVendorModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Onboard Vendor</button>
          </div>
        </form>
      </Modal>

      {/* WAREHOUSE MODAL */}
      <Modal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        title="Add Storage Facility"
        subtitle="Define inventory depot or staging area"
      >
        <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label className="label">Location Code *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. WH-PUN"
                value={warehouseForm.code}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Facility Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Pune Regional Staging Warehouse"
                value={warehouseForm.name}
                onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Physical Address *</label>
            <input
              type="text"
              className="form-control"
              value={warehouseForm.location}
              onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsWarehouseModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Warehouse</button>
          </div>
        </form>
      </Modal>

      {/* CONFIG MODAL */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configure Business Rule Parameter"
        subtitle="Set organizational thresholds and automated approval gates"
      >
        <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Configuration Key *</label>
            <select
              className="form-control"
              value={configForm.key}
              onChange={(e) => setConfigForm({ ...configForm, key: e.target.value })}
            >
              <option value="MAX_DISCOUNT_PERCENT">MAX_DISCOUNT_PERCENT (Sales threshold)</option>
              <option value="MIN_ADVANCE_PAYMENT_PERCENT">MIN_ADVANCE_PAYMENT_PERCENT (Production gate)</option>
              <option value="QA_PULLDOWN_MIN_HOLD_HOURS">QA_PULLDOWN_MIN_HOLD_HOURS (Testing duration)</option>
              <option value="WARRANTY_DURATION_MONTHS">WARRANTY_DURATION_MONTHS (Standard duration)</option>
            </select>
          </div>

          <div>
            <label className="label">Parameter Value *</label>
            <input
              type="text"
              className="form-control"
              value={configForm.value}
              onChange={(e) => setConfigForm({ ...configForm, value: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsConfigModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Update Configuration</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MasterDataPage;
