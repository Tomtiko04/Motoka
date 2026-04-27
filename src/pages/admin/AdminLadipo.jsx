import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import {
  createAdminLadipoProduct,
  deleteAdminCompatibilityEntry,
  deleteAdminLadipoProduct,
  getAdminPartCompatibility,
  getAdminLadipoCapabilities,
  getAdminLadipoOrder,
  listAdminLadipoOrders,
  listAdminLadipoProducts,
  setAdminPartCompatibility,
  updateAdminLadipoOrderAssignee,
  updateAdminLadipoOrderStatus,
  updateAdminLadipoOrderWorkflow,
  updateAdminLadipoProduct,
} from '../../services/apiAdminLadipo';
import { getLadipoCategories } from '../../services/apiLadipo';

const ORDER_STATUSES = ['all', 'pending_payment', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_PROGRESSIONS = {
  pending_payment: ['processing', 'cancelled'],
  processing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const QUICK_ORDER_VIEWS = [
  { key: 'all', label: 'All visible' },
  { key: 'needs_action', label: 'Needs action' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'mine', label: 'Mine' },
  { key: 'others', label: 'Others' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'stale_24h', label: 'Stale > 24h' },
  { key: 'high_value', label: 'High value (>= ₦100k)' },
  { key: 'cancelled', label: 'Cancelled' },
];
const BULK_ACTION_STATUSES = ['processing', 'out_for_delivery', 'delivered'];

const initialProductForm = {
  name: '',
  slug: '',
  category_id: '',
  brand: '',
  description: '',
  condition: 'new',
  part_type: 'aftermarket',
  price_naira: '',
  stock_qty: '',
  seller_label: 'Motoka',
  is_universal: false,
  is_active: true,
};

const emptyCompatibilityEntry = {
  make: '',
  model: '',
  year_min: '',
  year_max: '',
};

function formatPrice(kobo) {
  return `₦${(Number(kobo || 0) / 100).toLocaleString('en-NG')}`;
}

function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function resolveAdminProductImageUrl(product) {
  if (!product) return null;
  if (product.primary_image_url) return product.primary_image_url;
  const imgs = product.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return null;
  const first = imgs[0];
  if (typeof first === 'string') return first;
  if (first && typeof first.url === 'string') return first.url;
  if (first && typeof first.public_url === 'string') return first.public_url;
  return null;
}

function slugifyFromName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

function deriveUiOrderStatus(order) {
  const dbStatus = String(order?.order_status || '').toLowerCase();
  if (dbStatus === 'out_for_delivery') return 'out_for_delivery';
  if (dbStatus === 'pending_payment') return 'pending_payment';
  if (dbStatus === 'processing') return 'processing';
  if (dbStatus === 'delivered') return 'delivered';
  if (dbStatus === 'cancelled') return 'cancelled';
  return dbStatus || 'pending_payment';
}

function isOrderStale(order) {
  const updatedAt = new Date(order.updated_at || order.created_at || Date.now()).getTime();
  if (Number.isNaN(updatedAt)) return false;
  return Date.now() - updatedAt > 24 * 60 * 60 * 1000;
}

function isPickupOrder(order) {
  return String(order?.delivery?.method || '').toLowerCase() === 'pickup';
}

function formatAdminStatusLabel(order, status) {
  if (status === 'pending_payment') return 'awaiting payment';
  if (status === 'processing') return 'preparing order';
  if (status === 'out_for_delivery' && isPickupOrder(order)) return 'ready for pickup';
  if (status === 'out_for_delivery') return 'out for delivery';
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  return String(status || '').replace(/_/g, ' ');
}

function formatNextActionLabel(order, nextStatus) {
  if (nextStatus === 'processing') return 'start preparing';
  if (nextStatus === 'out_for_delivery' && isPickupOrder(order)) return 'mark ready for pickup';
  if (nextStatus === 'out_for_delivery') return 'mark out for delivery';
  if (nextStatus === 'delivered') return 'mark delivered';
  if (nextStatus === 'cancelled') return 'cancel order';
  return nextStatus.replace(/_/g, ' ');
}

function normalizeAdminName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function handlerKeyForAdmin(name) {
  const n = normalizeAdminName(name);
  return n.length >= 2 ? n.toLowerCase() : '';
}

function orderHandlerKey(order) {
  if (order?.handled_by_key) return String(order.handled_by_key).toLowerCase();
  return handlerKeyForAdmin(order?.handled_by_name || '');
}

function isHighValueOrder(order) {
  return Number(order?.total_kobo || 0) >= 10000000;
}

function slaBadgeForOrder(order, adminName) {
  const me = handlerKeyForAdmin(adminName);
  const hk = orderHandlerKey(order);
  const paidAt = order.paid_at ? new Date(order.paid_at).getTime() : null;
  const now = Date.now();
  if (order.workflow_state === 'blocked') return { label: 'blocked', tone: 'bg-rose-100 text-rose-800' };
  if (!hk && paidAt && !Number.isNaN(paidAt) && now - paidAt > 15 * 60 * 1000) {
    return { label: 'unassigned 15m+', tone: 'bg-amber-100 text-amber-800' };
  }
  if (me && hk === me && isOrderStale(order)) {
    return { label: 'mine stale', tone: 'bg-orange-100 text-orange-800' };
  }
  return null;
}

export default function AdminLadipo() {
  const [activeTab, setActiveTab] = useState('orders');

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersMeta, setOrdersMeta] = useState({ current_page: 1, per_page: 15, total: 0, last_page: 1 });
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);
  const [quickOrderView, setQuickOrderView] = useState('all');
  const [orderDensity, setOrderDensity] = useState('cozy');
  const [orderSort, setOrderSort] = useState({ field: 'updated_at', direction: 'desc' });
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelTargetOrderNumber, setCancelTargetOrderNumber] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [adminDisplayName, setAdminDisplayName] = useState('');
  const [showAdminNameModal, setShowAdminNameModal] = useState(false);
  const [adminNameDraft, setAdminNameDraft] = useState('');
  const [selectedOrderNumbers, setSelectedOrderNumbers] = useState([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [assigneeApiReady, setAssigneeApiReady] = useState(true);
  const [workflowApiReady, setWorkflowApiReady] = useState(true);
  const [capabilitiesChecked, setCapabilitiesChecked] = useState(false);
  const [cancelOrderSnapshot, setCancelOrderSnapshot] = useState(null);
  const [cancelConfirmTyping, setCancelConfirmTyping] = useState('');
  const [blockReasonDraft, setBlockReasonDraft] = useState('');
  const [workflowSubmitting, setWorkflowSubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const debouncedProductQuery = useDebouncedValue(productQuery, 320);
  const [productsPage, setProductsPage] = useState(1);
  const [productsMeta, setProductsMeta] = useState({ current_page: 1, per_page: 20, total: 0, last_page: 1 });
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImageObjectUrl, setProductImageObjectUrl] = useState(null);
  const [editingProductCoverUrl, setEditingProductCoverUrl] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [compatibilityEntries, setCompatibilityEntries] = useState([]);
  const [compatibilityDraft, setCompatibilityDraft] = useState(emptyCompatibilityEntry);
  const [compatibilityLoading, setCompatibilityLoading] = useState(false);
  const productImageInputRef = useRef(null);
  const slugManuallyEdited = useRef(false);
  // 'add' | 'edit' | 'view'
  const [productPanelMode, setProductPanelMode] = useState('add');
  const [viewingProduct, setViewingProduct] = useState(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const listParams = {
        page: ordersPage,
        per_page: ordersMeta.per_page,
        status: orderStatus,
        search: orderSearch || undefined,
      };
      const meKey = handlerKeyForAdmin(adminDisplayName);
      if (quickOrderView === 'mine' && meKey) listParams.handler_key = meKey;
      if (quickOrderView === 'unassigned') listParams.unassigned = '1';
      if (quickOrderView === 'others' && meKey) listParams.exclude_handler_key = meKey;
      if (quickOrderView === 'blocked') listParams.workflow_state = 'blocked';

      const res = await listAdminLadipoOrders(listParams);
      setOrders(res.data?.data || []);
      setOrdersMeta((prev) => ({
        ...prev,
        current_page: res.data?.current_page || ordersPage,
        per_page: res.data?.per_page || prev.per_page,
        total: res.data?.total || 0,
        last_page: res.data?.last_page || 1,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to load Ladipo orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [orderSearch, orderStatus, ordersPage, ordersMeta.per_page, quickOrderView, adminDisplayName]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await listAdminLadipoProducts({
        page: productsPage,
        per_page: productsMeta.per_page,
        search: debouncedProductQuery.trim() || undefined,
      });
      setProducts(res.data?.data || []);
      setProductsMeta((prev) => ({
        ...prev,
        current_page: res.data?.current_page || productsPage,
        per_page: res.data?.per_page || prev.per_page,
        total: res.data?.total || 0,
        last_page: res.data?.last_page || 1,
      }));
    } catch (error) {
      toast.error(error.message || 'Failed to load Ladipo products');
    } finally {
      setProductsLoading(false);
    }
  }, [debouncedProductQuery, productsPage, productsMeta.per_page]);

  useEffect(() => {
    if (activeTab === 'orders') loadOrders();
  }, [activeTab, loadOrders]);

  useEffect(() => {
    if (activeTab !== 'orders') return;
    let cancelled = false;
    getAdminLadipoCapabilities()
      .then((res) => {
        if (!cancelled) {
          setAssigneeApiReady(Boolean(res?.data?.assignee_route));
          setWorkflowApiReady(Boolean(res?.data?.workflow_route));
          setCapabilitiesChecked(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAssigneeApiReady(false);
          setWorkflowApiReady(false);
          setCapabilitiesChecked(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'products') loadProducts();
  }, [activeTab, loadProducts]);

  useEffect(() => {
    getLadipoCategories()
      .then((data) => setCategories(data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ladipoAdminDisplayName') || '';
    setAdminDisplayName(saved);
    setAdminNameDraft(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('ladipoAdminDisplayName', adminDisplayName);
  }, [adminDisplayName]);

  useEffect(() => {
    setOrdersPage(1);
  }, [orderSearch, orderStatus, quickOrderView]);

  useEffect(() => {
    if (selectedOrder?.block_reason) {
      setBlockReasonDraft(selectedOrder.block_reason);
    } else if (selectedOrder) {
      setBlockReasonDraft('');
    }
  }, [selectedOrderNumber, selectedOrder?.order_number, selectedOrder?.block_reason]);

  useEffect(() => {
    setProductsPage(1);
  }, [debouncedProductQuery]);

  useEffect(() => {
    if (!productImageFile) {
      setProductImageObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(productImageFile);
    setProductImageObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [productImageFile]);

  const groupedCategories = useMemo(() => {
    return (categories || []).filter((item) => item.parent_id);
  }, [categories]);

  const categoryById = useMemo(() => {
    const map = new Map();
    (categories || []).forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const orderKpis = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const now = new Date();
    const todayKey = now.toDateString();
    const newToday = list.filter((order) => new Date(order.created_at).toDateString() === todayKey).length;
    const processing = list.filter((order) => deriveUiOrderStatus(order) === 'processing').length;
    const outForDelivery = list.filter((order) => deriveUiOrderStatus(order) === 'out_for_delivery').length;
    const deliveredToday = list.filter((order) => (
      deriveUiOrderStatus(order) === 'delivered' && new Date(order.updated_at || order.created_at).toDateString() === todayKey
    )).length;
    const cancelled = list.filter((order) => deriveUiOrderStatus(order) === 'cancelled').length;
    const cancellationRate = list.length > 0 ? Math.round((cancelled / list.length) * 100) : 0;
    const needsAction = list.filter((order) => {
      const status = deriveUiOrderStatus(order);
      return status === 'pending_payment' || status === 'processing' || status === 'out_for_delivery';
    }).length;

    return [
      { label: 'New today', value: newToday, tone: 'text-blue-700 bg-blue-50' },
      { label: 'Needs action', value: needsAction, tone: 'text-amber-700 bg-amber-50' },
      { label: 'Preparing', value: processing, tone: 'text-indigo-700 bg-indigo-50' },
      { label: 'Out / Ready', value: outForDelivery, tone: 'text-purple-700 bg-purple-50' },
      { label: 'Delivered today', value: deliveredToday, tone: 'text-emerald-700 bg-emerald-50' },
      { label: 'Cancelled rate', value: `${cancellationRate}%`, tone: 'text-rose-700 bg-rose-50' },
    ];
  }, [orders]);

  const quickViewCount = useMemo(() => {
    const source = Array.isArray(orders) ? orders : [];
    const meKey = handlerKeyForAdmin(adminDisplayName);
    return QUICK_ORDER_VIEWS.reduce((acc, view) => {
      if (view.key === 'all') {
        acc[view.key] = source.length;
      } else if (view.key === 'needs_action') {
        acc[view.key] = source.filter((order) => {
          const status = deriveUiOrderStatus(order);
          return status === 'pending_payment' || status === 'processing' || status === 'out_for_delivery';
        }).length;
      } else if (view.key === 'unassigned') {
        acc[view.key] = source.filter((order) => !orderHandlerKey(order)).length;
      } else if (view.key === 'mine') {
        acc[view.key] = meKey ? source.filter((order) => orderHandlerKey(order) === meKey).length : 0;
      } else if (view.key === 'others') {
        acc[view.key] = meKey
          ? source.filter((order) => {
            const handler = orderHandlerKey(order);
            return handler && handler !== meKey;
          }).length
          : 0;
      } else if (view.key === 'blocked') {
        acc[view.key] = source.filter((order) => order.workflow_state === 'blocked').length;
      } else if (view.key === 'stale_24h') {
        acc[view.key] = source.filter(isOrderStale).length;
      } else if (view.key === 'high_value') {
        acc[view.key] = source.filter((order) => Number(order.total_kobo || 0) >= 10000000).length;
      } else if (view.key === 'cancelled') {
        acc[view.key] = source.filter((order) => deriveUiOrderStatus(order) === 'cancelled').length;
      }
      return acc;
    }, {});
  }, [orders, adminDisplayName]);

  const displayedOrders = useMemo(() => {
    let list = Array.isArray(orders) ? [...orders] : [];

    if (quickOrderView === 'needs_action') {
      list = list.filter((order) => {
        const status = deriveUiOrderStatus(order);
        return status === 'pending_payment' || status === 'processing' || status === 'out_for_delivery';
      });
    } else if (quickOrderView === 'stale_24h') {
      list = list.filter(isOrderStale);
    } else if (quickOrderView === 'high_value') {
      list = list.filter((order) => Number(order.total_kobo || 0) >= 10000000);
    } else if (quickOrderView === 'cancelled') {
      list = list.filter((order) => deriveUiOrderStatus(order) === 'cancelled');
    }

    list.sort((a, b) => {
      const direction = orderSort.direction === 'asc' ? 1 : -1;
      if (orderSort.field === 'total_kobo') {
        return (Number(a.total_kobo || 0) - Number(b.total_kobo || 0)) * direction;
      }
      if (orderSort.field === 'items_count') {
        return (((a.items || []).length) - ((b.items || []).length)) * direction;
      }
      if (orderSort.field === 'status') {
        return String(deriveUiOrderStatus(a)).localeCompare(String(deriveUiOrderStatus(b))) * direction;
      }
      if (orderSort.field === 'customer') {
        return String(a.user_name || '').localeCompare(String(b.user_name || '')) * direction;
      }
      const aDate = new Date(a[orderSort.field] || a.updated_at || a.created_at || 0).getTime();
      const bDate = new Date(b[orderSort.field] || b.updated_at || b.created_at || 0).getTime();
      return (aDate - bDate) * direction;
    });

    return list;
  }, [orders, quickOrderView, orderSort]);
  const displayedOrderNumbers = useMemo(
    () => displayedOrders.map((order) => order.order_number).filter(Boolean),
    [displayedOrders],
  );
  const selectedVisibleCount = useMemo(
    () => displayedOrderNumbers.filter((orderNumber) => selectedOrderNumbers.includes(orderNumber)).length,
    [displayedOrderNumbers, selectedOrderNumbers],
  );

  const rowPaddingClass = orderDensity === 'compact' ? 'py-2' : 'py-3';

  const toggleOrderSort = (field) => {
    setOrderSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'desc' };
    });
  };

  useEffect(() => {
    setSelectedOrderNumbers((prev) => prev.filter((orderNumber) => displayedOrderNumbers.includes(orderNumber)));
  }, [displayedOrderNumbers]);

  const submitOrderStatusUpdate = async (orderNumber, nextStatus, reason) => {
    const handlerName = normalizeAdminName(adminDisplayName);
    if (handlerName.length < 2) {
      toast.error('Enter your name before updating order status');
      return;
    }
    const sourceOrder = orders.find((o) => o.order_number === orderNumber)
      || (selectedOrder?.order_number === orderNumber ? selectedOrder : null);
    try {
      await updateAdminLadipoOrderStatus(orderNumber, {
        status: nextStatus,
        reason,
        handledByName: handlerName,
        expectedAdminOpsVersion: sourceOrder?.admin_ops_version,
      });
    } catch (error) {
      if (error.status === 409) {
        toast.error(error.message || 'Order was updated by another session. Refreshing.');
        await loadOrders();
        if (selectedOrderNumber === orderNumber) {
          const details = await getAdminLadipoOrder(orderNumber);
          setSelectedOrder(details.data || null);
        }
      }
      throw error;
    }
    const nextStatusLabel = nextStatus === 'processing'
      ? 'preparing order'
      : nextStatus === 'out_for_delivery'
        ? 'out for delivery / ready for pickup'
        : nextStatus === 'delivered'
          ? 'delivered'
          : nextStatus === 'cancelled'
            ? 'cancelled'
            : nextStatus.replace(/_/g, ' ');
    toast.success(`Order moved to ${nextStatusLabel}`);
    loadOrders();
    if (selectedOrderNumber === orderNumber) {
      const details = await getAdminLadipoOrder(orderNumber);
      setSelectedOrder(details.data || null);
    }
  };

  const openCancelReasonModal = (orderNumber) => {
    const order = orders.find((o) => o.order_number === orderNumber)
      || (selectedOrder?.order_number === orderNumber ? selectedOrder : null);
    setCancelOrderSnapshot(order ? {
      order_number: order.order_number,
      total_kobo: order.total_kobo,
      admin_ops_version: order.admin_ops_version,
    } : { order_number: orderNumber, total_kobo: 0, admin_ops_version: undefined });
    setCancelTargetOrderNumber(orderNumber);
    setCancelReason('');
    setCancelConfirmTyping('');
    setShowCancelReasonModal(true);
  };

  const closeCancelReasonModal = () => {
    if (cancelSubmitting) return;
    setShowCancelReasonModal(false);
    setCancelTargetOrderNumber(null);
    setCancelReason('');
    setCancelOrderSnapshot(null);
    setCancelConfirmTyping('');
  };

  const confirmCancellation = async () => {
    if (!cancelTargetOrderNumber) return;
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      toast.error('Cancellation reason is required');
      return;
    }
    if (trimmedReason.length < 10) {
      toast.error('Cancellation reason must be at least 10 characters');
      return;
    }
    const snap = cancelOrderSnapshot;
    if (snap && isHighValueOrder(snap)) {
      if (cancelConfirmTyping.trim() !== snap.order_number) {
        toast.error('Type the order number exactly to confirm cancellation');
        return;
      }
    }

    setCancelSubmitting(true);
    try {
      await submitOrderStatusUpdate(cancelTargetOrderNumber, 'cancelled', trimmedReason);
      closeCancelReasonModal();
    } catch (error) {
      if (error.status !== 409) {
        toast.error(error.message || 'Failed to update order status');
      }
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleOrderStatusUpdate = async (orderNumber, nextStatus) => {
    if (nextStatus === 'cancelled') {
      openCancelReasonModal(orderNumber);
      return;
    }

    try {
      await submitOrderStatusUpdate(orderNumber, nextStatus);
    } catch (error) {
      if (error.status !== 409) {
        toast.error(error.message || 'Failed to update order status');
      }
    }
  };

  const toggleSelectOrder = (orderNumber) => {
    setSelectedOrderNumbers((prev) => (
      prev.includes(orderNumber)
        ? prev.filter((current) => current !== orderNumber)
        : [...prev, orderNumber]
    ));
  };

  const toggleSelectAllVisible = () => {
    if (displayedOrderNumbers.length === 0) return;
    if (selectedVisibleCount === displayedOrderNumbers.length) {
      setSelectedOrderNumbers((prev) => prev.filter((orderNumber) => !displayedOrderNumbers.includes(orderNumber)));
      return;
    }
    setSelectedOrderNumbers((prev) => Array.from(new Set([...prev, ...displayedOrderNumbers])));
  };

  const handleBulkStatusUpdate = async (nextStatus) => {
    if (selectedOrderNumbers.length === 0) {
      toast.error('Select at least one order');
      return;
    }
    if (nextStatus === 'cancelled') {
      toast.error('Bulk cancel is disabled because cancellation reason is required per order.');
      return;
    }

    const handlerName = normalizeAdminName(adminDisplayName);
    if (handlerName.length < 2) {
      toast.error('Enter your name before running bulk actions');
      return;
    }

    setBulkSubmitting(true);
    try {
      let successCount = 0;
      for (const orderNumber of selectedOrderNumbers) {
        try {
          const ord = orders.find((o) => o.order_number === orderNumber);
          await updateAdminLadipoOrderStatus(orderNumber, {
            status: nextStatus,
            handledByName: handlerName,
            expectedAdminOpsVersion: ord?.admin_ops_version,
          });
          successCount += 1;
        } catch {
          // Keep bulk flow moving even if some orders fail.
        }
      }

      if (successCount === 0) {
        toast.error('Bulk update failed. Please try again.');
        return;
      }

      if (successCount < selectedOrderNumbers.length) {
        toast.success(`${successCount} of ${selectedOrderNumbers.length} orders moved to ${nextStatus.replace(/_/g, ' ')}.`);
      } else {
        toast.success(`${successCount} orders moved to ${nextStatus.replace(/_/g, ' ')}.`);
      }
      setSelectedOrderNumbers([]);
      await loadOrders();
    } finally {
      setBulkSubmitting(false);
    }
  };

  const updateOrderAssignee = async (orderNumber, nextHandledByName) => {
    const order = orders.find((o) => o.order_number === orderNumber)
      || (selectedOrder?.order_number === orderNumber ? selectedOrder : null);
    const response = await updateAdminLadipoOrderAssignee(orderNumber, nextHandledByName, {
      expectedAdminOpsVersion: order?.admin_ops_version,
      assignedByName: normalizeAdminName(adminDisplayName),
    });
    const updated = response?.data;
    if (updated) {
      setOrders((prev) => prev.map((item) => (
        item.order_number === orderNumber ? { ...item, ...updated } : item
      )));
      if (selectedOrderNumber === orderNumber) {
        setSelectedOrder(updated);
      }
    } else {
      await loadOrders();
    }
    toast.success(nextHandledByName ? `Order claimed by ${nextHandledByName}` : 'Order released');
  };

  const claimOrder = async (orderNumber) => {
    if (!capabilitiesChecked || !assigneeApiReady) {
      toast.error('Assignment API is not available. Deploy the latest backend and restart the server.');
      return;
    }
    const handlerName = normalizeAdminName(adminDisplayName);
    if (handlerName.length < 2) {
      toast.error('Enter your name before claiming an order');
      return;
    }
    try {
      await updateOrderAssignee(orderNumber, handlerName);
    } catch (error) {
      if (error.status === 409) {
        toast.error(error.message || 'Order was updated by another session. Refreshing.');
        await loadOrders();
        if (selectedOrderNumber === orderNumber) {
          const details = await getAdminLadipoOrder(orderNumber);
          setSelectedOrder(details.data || null);
        }
        return;
      }
      toast.error(error.message || 'Failed to update order assignee');
    }
  };

  const releaseOrder = async (orderNumber) => {
    if (!capabilitiesChecked || !assigneeApiReady) {
      toast.error('Assignment API is not available. Deploy the latest backend and restart the server.');
      return;
    }
    try {
      await updateOrderAssignee(orderNumber, null);
    } catch (error) {
      if (error.status === 409) {
        toast.error(error.message || 'Order was updated by another session. Refreshing.');
        await loadOrders();
        if (selectedOrderNumber === orderNumber) {
          const details = await getAdminLadipoOrder(orderNumber);
          setSelectedOrder(details.data || null);
        }
        return;
      }
      toast.error(error.message || 'Failed to release order');
    }
  };

  const handleWorkflowUpdate = async (workflowState, blockReason) => {
    if (!selectedOrder?.order_number) return;
    if (!capabilitiesChecked || !workflowApiReady) {
      toast.error('Workflow API is not available on this server.');
      return;
    }
    const handlerName = normalizeAdminName(adminDisplayName);
    if (handlerName.length < 2) {
      toast.error('Enter your name before changing workflow');
      return;
    }
    if (workflowState === 'blocked' && String(blockReason || '').trim().length < 3) {
      toast.error('Enter a block reason (at least 3 characters)');
      return;
    }
    setWorkflowSubmitting(true);
    try {
      const res = await updateAdminLadipoOrderWorkflow(selectedOrder.order_number, {
        workflowState,
        blockReason: workflowState === 'blocked' ? blockReason : undefined,
        handledByName: handlerName,
        expectedAdminOpsVersion: selectedOrder.admin_ops_version,
      });
      const updated = res?.data;
      if (updated) {
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((item) => (
          item.order_number === updated.order_number ? { ...item, ...updated } : item
        )));
      }
      await loadOrders();
      toast.success(workflowState === 'blocked' ? 'Order marked as blocked' : 'Order unblocked');
      setBlockReasonDraft('');
    } catch (error) {
      if (error.status === 409) {
        toast.error(error.message || 'Order was updated by another session. Refreshing.');
        await loadOrders();
        const details = await getAdminLadipoOrder(selectedOrder.order_number);
        setSelectedOrder(details.data || null);
        return;
      }
      toast.error(error.message || 'Failed to update workflow');
    } finally {
      setWorkflowSubmitting(false);
    }
  };

  const openOrderDetails = async (orderNumber) => {
    setSelectedOrderNumber(orderNumber);
    setSelectedOrder(null);
    setSelectedOrderLoading(true);
    try {
      const details = await getAdminLadipoOrder(orderNumber);
      setSelectedOrder(details.data || null);
    } catch (error) {
      toast.error(error.message || 'Failed to load order details');
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrderNumber(null);
    setSelectedOrder(null);
    setSelectedOrderLoading(false);
  };

  const loadProductCompatibility = async (productId) => {
    if (!productId) {
      setCompatibilityEntries([]);
      return;
    }
    setCompatibilityLoading(true);
    try {
      const res = await getAdminPartCompatibility(productId);
      setCompatibilityEntries(res?.data || []);
    } catch {
      setCompatibilityEntries([]);
      toast.error('Failed to load compatibility entries');
    } finally {
      setCompatibilityLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setEditingProductId(null);
    setProductImageFile(null);
    setEditingProductCoverUrl(null);
    setViewingProduct(null);
    setProductPanelMode('add');
    setCompatibilityEntries([]);
    setCompatibilityDraft(emptyCompatibilityEntry);
    setCompatibilityLoading(false);
    slugManuallyEdited.current = false;
    if (productImageInputRef.current) productImageInputRef.current.value = '';
  };

  const startEditProduct = async (product) => {
    slugManuallyEdited.current = true;
    setEditingProductId(product.id);
    setEditingProductCoverUrl(resolveAdminProductImageUrl(product));
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      category_id: product.category_id || '',
      brand: product.brand || '',
      description: product.description || '',
      condition: product.condition || 'new',
      part_type: product.part_type || 'aftermarket',
      price_naira:
        product.inventory?.price_kobo != null
          ? Number(product.inventory.price_kobo) / 100
          : '',
      stock_qty: product.inventory?.stock_qty ?? '',
      seller_label: product.inventory?.seller_label || 'Motoka',
      is_universal: product.is_universal ?? false,
      is_active: product.is_active ?? true,
    });
    setCompatibilityDraft(emptyCompatibilityEntry);
    setProductImageFile(null);
    if (productImageInputRef.current) productImageInputRef.current.value = '';
    await loadProductCompatibility(product.id);
  };

  const clearPendingProductImage = () => {
    setProductImageFile(null);
    if (productImageInputRef.current) productImageInputRef.current.value = '';
  };

  const addCompatibilityEntry = () => {
    const make = String(compatibilityDraft.make || '').trim();
    if (!make) {
      toast.error('Compatibility make is required');
      return;
    }

    const yearMin = compatibilityDraft.year_min === '' ? null : Number(compatibilityDraft.year_min);
    const yearMax = compatibilityDraft.year_max === '' ? null : Number(compatibilityDraft.year_max);

    if ((yearMin != null && Number.isNaN(yearMin)) || (yearMax != null && Number.isNaN(yearMax))) {
      toast.error('Compatibility years must be valid numbers');
      return;
    }
    if (yearMin != null && yearMax != null && yearMin > yearMax) {
      toast.error('Year min cannot be greater than year max');
      return;
    }

    setCompatibilityEntries((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        make,
        model: String(compatibilityDraft.model || '').trim(),
        year_min: yearMin,
        year_max: yearMax,
      },
    ]);
    setCompatibilityDraft(emptyCompatibilityEntry);
  };

  const removeCompatibilityEntry = async (entryId) => {
    if (!entryId) return;
    const isServerEntry = !String(entryId).startsWith('local-');

    if (isServerEntry) {
      try {
        await deleteAdminCompatibilityEntry(entryId);
      } catch {
        // Keep local UX responsive even when delete endpoint fails; save will upsert final set.
      }
    }

    setCompatibilityEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  };

  const priceKoboPreview = useMemo(() => {
    const raw = productForm.price_naira;
    if (raw === '' || raw === null || Number.isNaN(Number(raw))) return null;
    return Math.round(Number(raw) * 100).toLocaleString('en-NG');
  }, [productForm.price_naira]);

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    try {
      const normalizedCompatibility = (compatibilityEntries || [])
        .map((entry) => ({
          ...entry,
          make: String(entry?.make || '').trim(),
          model: String(entry?.model || '').trim(),
          year_min: entry?.year_min === '' || entry?.year_min == null ? null : Number(entry.year_min),
          year_max: entry?.year_max === '' || entry?.year_max == null ? null : Number(entry.year_max),
        }))
        .filter((entry) => entry.make);

      const payload = new FormData();
      payload.append('name', productForm.name);
      payload.append('slug', productForm.slug);
      payload.append('category_id', productForm.category_id);
      payload.append('brand', productForm.brand || '');
      payload.append('description', productForm.description || '');
      payload.append('condition', productForm.condition);
      payload.append('part_type', productForm.part_type);
      payload.append('price_kobo', String(Math.round(Number(productForm.price_naira) * 100)));
      payload.append('stock_qty', String(Number(productForm.stock_qty)));
      payload.append('seller_label', productForm.seller_label || 'Motoka');
      payload.append('is_universal', String(Boolean(productForm.is_universal)));
      payload.append('is_active', String(Boolean(productForm.is_active)));
      if (editingProductId) {
        const existing = products.find((item) => item.id === editingProductId);
        if (existing?.images?.length) {
          payload.append('images', JSON.stringify(existing.images));
        }
      }
      if (productImageFile) {
        payload.append('image_file', productImageFile);
      }

      if (editingProductId) {
        const res = await updateAdminLadipoProduct(editingProductId, payload);
        const targetPartId = res?.data?.id || editingProductId;
        await setAdminPartCompatibility(
          targetPartId,
          productForm.is_universal ? [] : normalizedCompatibility
        );
        toast.success('Product updated');
      } else {
        const res = await createAdminLadipoProduct(payload);
        const targetPartId = res?.data?.id;
        if (targetPartId) {
          await setAdminPartCompatibility(
            targetPartId,
            productForm.is_universal ? [] : normalizedCompatibility
          );
        }
        toast.success('Product created');
      }
      resetProductForm();
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await deleteAdminLadipoProduct(productId);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const openAdminNameModal = () => {
    setAdminNameDraft(adminDisplayName || '');
    setShowAdminNameModal(true);
  };

  const closeAdminNameModal = () => {
    setShowAdminNameModal(false);
  };

  const saveAdminName = () => {
    const normalized = normalizeAdminName(adminNameDraft);
    if (normalized.length < 2) {
      toast.error('Enter at least 2 characters for admin name');
      return;
    }
    setAdminDisplayName(normalized);
    setShowAdminNameModal(false);
    toast.success(`Admin name registered: ${normalized}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#05243F]">Ladipo Admin</h1>
          <p className="text-sm text-gray-500">Manage Ladipo orders and products in one place.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {['orders', 'products'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              activeTab === tab ? 'bg-[#2284DB] text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tab === 'orders' ? 'Orders' : 'Products'}
          </button>
        ))}
      </div>

      {activeTab === 'orders' && (
        <div className="space-y-3">

          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {orderKpis.map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className={`mt-1.5 inline-flex rounded-full px-2.5 py-0.5 text-sm font-bold ${kpi.tone}`}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* API warning */}
          {capabilitiesChecked && (!assigneeApiReady || !workflowApiReady) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-semibold text-amber-950">Some Ladipo admin actions are unavailable on this server.</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-xs">
                {!assigneeApiReady && <li>Claim/release disabled — deploy latest backend (migration 056) and restart.</li>}
                {!workflowApiReady && <li>Workflow (block/unblock) disabled — deploy latest backend and restart.</li>}
              </ul>
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
            {/* Row 1: identity + search + filter + refresh */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Admin identity */}
              <button
                onClick={openAdminNameModal}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  normalizeAdminName(adminDisplayName)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Icon icon="solar:user-bold" className="h-3.5 w-3.5" />
                {normalizeAdminName(adminDisplayName) ? adminDisplayName : 'Set your name'}
              </button>

              <div className="mx-1 h-4 w-px bg-gray-200" />

              {/* Search */}
              <div className="relative min-w-[200px] flex-1">
                <Icon
                  icon="solar:magnifer-linear"
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order number…"
                  className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                />
              </div>

              {/* Status filter */}
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-[#2284DB]"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All statuses'
                      : status === 'pending_payment' ? 'Awaiting payment'
                      : status === 'processing' ? 'Preparing'
                      : status === 'out_for_delivery' ? 'Out / Ready'
                      : status === 'delivered' ? 'Delivered'
                      : 'Cancelled'}
                  </option>
                ))}
              </select>

              {/* Refresh */}
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="inline-flex items-center gap-1 rounded-lg bg-[#2284DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d74c3] disabled:opacity-60"
              >
                <Icon icon="solar:refresh-linear" className="h-3.5 w-3.5" />
                Refresh
              </button>

              {/* Density toggle */}
              <button
                onClick={() => setOrderDensity((prev) => (prev === 'compact' ? 'cozy' : 'compact'))}
                title={`Density: ${orderDensity}`}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <Icon
                  icon={orderDensity === 'compact' ? 'solar:list-bold' : 'solar:list-down-bold'}
                  className="h-4 w-4"
                />
              </button>
            </div>

            {/* Row 2: quick view pills */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ORDER_VIEWS.map((view) => (
                <button
                  key={view.key}
                  onClick={() => setQuickOrderView(view.key)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${
                    quickOrderView === view.key
                      ? 'border-[#2284DB] bg-[#2284DB] text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#2284DB]/40 hover:text-[#2284DB]'
                  }`}
                >
                  {view.label}
                  <span className={`ml-1 ${quickOrderView === view.key ? 'opacity-75' : 'text-gray-400'}`}>
                    ({quickViewCount[view.key] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Bulk action bar ── */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
            <button
              onClick={toggleSelectAllVisible}
              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              {selectedVisibleCount === displayedOrderNumbers.length && displayedOrderNumbers.length > 0
                ? 'Deselect all'
                : 'Select all'}
            </button>
            {selectedOrderNumbers.length > 0 && (
              <span className="rounded-full bg-[#2284DB]/10 px-2 py-0.5 text-xs font-semibold text-[#2284DB]">
                {selectedOrderNumbers.length} selected
              </span>
            )}
            {selectedOrderNumbers.length === 0 && (
              <span className="text-xs text-gray-400">Select orders to apply bulk actions</span>
            )}
            <div className="ml-auto flex flex-wrap gap-1.5">
              {BULK_ACTION_STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={bulkSubmitting || selectedOrderNumbers.length === 0}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="rounded-full border border-[#2284DB] px-3 py-1 text-[11px] font-semibold text-[#2284DB] hover:bg-[#2284DB] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {bulkSubmitting ? '…' : `Bulk: ${
                    status === 'processing' ? 'Preparing'
                      : status === 'out_for_delivery' ? 'Out / Ready'
                      : 'Delivered'
                  }`}
                </button>
              ))}
            </div>
          </div>

          {/* ── Orders table ── */}
          <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table className="min-w-full">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-8 px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={displayedOrderNumbers.length > 0 && selectedVisibleCount === displayedOrderNumbers.length}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all visible orders"
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <button onClick={() => toggleOrderSort('customer')} className="flex items-center gap-1 hover:text-gray-700">
                      Customer
                      <Icon icon={orderSort.field === 'customer' ? (orderSort.direction === 'asc' ? 'solar:sort-from-top-to-bottom-bold' : 'solar:sort-from-bottom-to-top-bold') : 'solar:sort-outline'} className="h-3 w-3 opacity-40" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <button onClick={() => toggleOrderSort('total_kobo')} className="flex items-center gap-1 hover:text-gray-700">
                      Amount
                      <Icon icon={orderSort.field === 'total_kobo' ? (orderSort.direction === 'asc' ? 'solar:sort-from-top-to-bottom-bold' : 'solar:sort-from-bottom-to-top-bold') : 'solar:sort-outline'} className="h-3 w-3 opacity-40" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <button onClick={() => toggleOrderSort('status')} className="flex items-center gap-1 hover:text-gray-700">
                      Status
                      <Icon icon={orderSort.field === 'status' ? (orderSort.direction === 'asc' ? 'solar:sort-from-top-to-bottom-bold' : 'solar:sort-from-bottom-to-top-bold') : 'solar:sort-outline'} className="h-3 w-3 opacity-40" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Payment</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Handler</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <button onClick={() => toggleOrderSort('updated_at')} className="flex items-center gap-1 hover:text-gray-700">
                      Updated
                      <Icon icon={orderSort.field === 'updated_at' ? (orderSort.direction === 'asc' ? 'solar:sort-from-top-to-bottom-bold' : 'solar:sort-from-bottom-to-top-bold') : 'solar:sort-outline'} className="h-3 w-3 opacity-40" />
                    </button>
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <div className="inline-flex flex-col items-center gap-2 text-sm text-gray-400">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" />
                        Loading orders…
                      </div>
                    </td>
                  </tr>
                ) : displayedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                      No orders found for this filter.
                    </td>
                  </tr>
                ) : (
                  displayedOrders.map((order) => {
                    const uiStatus = deriveUiOrderStatus(order);
                    const statusBadge = {
                      pending_payment: 'bg-amber-50 text-amber-700',
                      processing:      'bg-blue-50 text-blue-700',
                      out_for_delivery:'bg-purple-50 text-purple-700',
                      delivered:       'bg-emerald-50 text-emerald-700',
                      cancelled:       'bg-rose-50 text-rose-600',
                    }[uiStatus] || 'bg-gray-100 text-gray-600';

                    const payBadge = {
                      paid:     'bg-emerald-50 text-emerald-700',
                      pending:  'bg-amber-50 text-amber-700',
                      failed:   'bg-rose-50 text-rose-600',
                      refunded: 'bg-slate-100 text-slate-600',
                    }[String(order.payment_status || '').toLowerCase()] || 'bg-gray-100 text-gray-500';

                    const sla = slaBadgeForOrder(order, adminDisplayName);
                    const meKey = handlerKeyForAdmin(adminDisplayName);
                    const handlerKey = orderHandlerKey(order);

                    // relative time
                    const updatedMs = new Date(order.updated_at || order.created_at || 0).getTime();
                    const diffMin = Math.floor((Date.now() - updatedMs) / 60000);
                    const relTime = diffMin < 1 ? 'just now'
                      : diffMin < 60 ? `${diffMin}m ago`
                      : diffMin < 1440 ? `${Math.floor(diffMin / 60)}h ago`
                      : `${Math.floor(diffMin / 1440)}d ago`;

                    return (
                      <tr key={order.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <input
                            type="checkbox"
                            checked={selectedOrderNumbers.includes(order.order_number)}
                            onChange={() => toggleSelectOrder(order.order_number)}
                            aria-label={`Select order ${order.order_number}`}
                            className="rounded border-gray-300"
                          />
                        </td>

                        {/* Order number */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <p className="font-mono text-xs font-semibold text-[#05243F]">{order.order_number}</p>
                          <p className="text-[10px] text-gray-400">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</p>
                        </td>

                        {/* Customer */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <p className="text-sm font-medium text-gray-800">{order.user_name}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{order.user_email || 'No email'}</p>
                        </td>

                        {/* Amount */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <p className="text-sm font-semibold text-[#05243F]">{order.total_naira}</p>
                          {isHighValueOrder(order) && (
                            <span className="text-[10px] font-bold text-amber-600">HIGH VALUE</span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusBadge}`}>
                              {formatAdminStatusLabel(order, order.order_status)}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {isOrderStale(order) && (
                                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">stale</span>
                              )}
                              {sla && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${sla.tone}`}>{sla.label}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Payment badge */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${payBadge}`}>
                            {(order.payment_status || 'pending').replace(/_/g, ' ')}
                          </span>
                        </td>

                        {/* Handler */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          {order.handled_by_name ? (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-xs text-gray-700">{order.handled_by_name}</span>
                              {meKey && handlerKey === meKey && (
                                <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">me</span>
                              )}
                              {meKey && handlerKey && handlerKey !== meKey && (
                                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">other</span>
                              )}
                            </div>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500">unassigned</span>
                          )}
                        </td>

                        {/* Relative time */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <span className="text-xs text-gray-500" title={formatDateTime(order.updated_at || order.created_at)}>
                            {relTime}
                          </span>
                        </td>

                        {/* Actions — compact */}
                        <td className={`px-3 ${rowPaddingClass}`}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openOrderDetails(order.order_number)}
                              className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:border-[#2284DB] hover:text-[#2284DB]"
                            >
                              View
                            </button>
                            {!handlerKey && (
                              <button
                                type="button"
                                disabled={!assigneeApiReady || !capabilitiesChecked || !meKey}
                                onClick={() => claimOrder(order.order_number)}
                                className="rounded-full border border-emerald-300 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Claim
                              </button>
                            )}
                            {handlerKey && handlerKey !== meKey && (
                              <button
                                type="button"
                                disabled={!assigneeApiReady || !capabilitiesChecked || !meKey}
                                onClick={() => claimOrder(order.order_number)}
                                className="rounded-full border border-amber-300 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Take
                              </button>
                            )}
                            {handlerKey && handlerKey === meKey && (
                              <button
                                type="button"
                                disabled={!assigneeApiReady || !capabilitiesChecked || !meKey}
                                onClick={() => releaseOrder(order.order_number)}
                                className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Release
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs text-gray-500 shadow-sm">
            <p>
              Page {ordersMeta.current_page} of {Math.max(ordersMeta.last_page, 1)} · {ordersMeta.total} order{ordersMeta.total !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={ordersPage <= 1 || ordersLoading}
                onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={ordersPage >= ordersMeta.last_page || ordersLoading}
                onClick={() => setOrdersPage((prev) => Math.min(ordersMeta.last_page || 1, prev + 1))}
                className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">

          {/* ── LEFT: compact product list ── */}
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
              <div className="relative min-w-[180px] flex-1">
                <Icon
                  icon="solar:magnifer-linear"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search name, slug, brand…"
                  className="w-full rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                  aria-label="Search products"
                />
              </div>
              <button
                type="button"
                onClick={loadProducts}
                disabled={productsLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Icon icon="solar:refresh-linear" className="h-3.5 w-3.5" />
                Refresh
              </button>
              <button
                type="button"
                onClick={resetProductForm}
                className="inline-flex items-center gap-1 rounded-lg bg-[#2284DB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d74c3]"
              >
                <Icon icon="solar:add-circle-bold" className="h-3.5 w-3.5" />
                Add product
              </button>
              <span className="ml-auto text-xs text-gray-400">
                {productsLoading ? 'Loading…' : `${productsMeta.total} product${productsMeta.total === 1 ? '' : 's'}`}
              </span>
            </div>

            {/* Rows */}
            <div className="space-y-1">
              {productsLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white py-12 text-sm text-gray-400">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2284DB] border-t-transparent" aria-hidden />
                  Loading products…
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
                  No products found.{' '}
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="font-semibold text-[#2284DB] hover:underline"
                  >
                    Add one.
                  </button>
                </div>
              ) : (
                products.map((product) => {
                  const imgUrl = resolveAdminProductImageUrl(product);
                  const cat = product.category_id ? categoryById.get(product.category_id) : null;
                  const parentName = cat?.parent_id ? categoryById.get(cat.parent_id)?.name : null;
                  const catLabel = parentName
                    ? `${parentName} · ${cat?.name || ''}`
                    : cat?.name || null;
                  const isEditing = editingProductId === product.id && productPanelMode === 'edit';
                  const isViewing = viewingProduct?.id === product.id && productPanelMode === 'view';
                  return (
                    <div
                      key={product.id}
                      className={`flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2 shadow-sm transition-colors ${
                        isEditing || isViewing
                          ? 'border-[#2284DB] ring-1 ring-[#2284DB]/20'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      {/* Tiny thumbnail */}
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <Icon icon="solar:gallery-remove-bold-duotone" className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold leading-tight text-[#05243F]">{product.name}</p>
                        <p className="truncate text-[11px] text-gray-400">
                          {[catLabel, product.brand].filter(Boolean).join(' · ') || product.slug}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
                          <span className="font-semibold text-[#2284DB]">{formatPrice(product.inventory?.price_kobo)}</span>
                          <span className="text-gray-400">Stock: <span className="font-medium text-gray-600">{product.inventory?.stock_qty ?? 0}</span></span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            product.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {product.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingProduct(product);
                            setProductPanelMode('view');
                            setEditingProductId(null);
                          }}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            isViewing
                              ? 'border-[#2284DB] bg-[#2284DB] text-white'
                              : 'border-gray-200 text-gray-600 hover:border-[#2284DB] hover:text-[#2284DB]'
                          }`}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            startEditProduct(product);
                            setProductPanelMode('edit');
                            setViewingProduct(null);
                          }}
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            isEditing
                              ? 'border-[#2284DB] bg-[#2284DB] text-white'
                              : 'border-gray-200 text-gray-600 hover:border-[#2284DB] hover:text-[#2284DB]'
                          }`}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {products.length > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
                <p>Page {productsMeta.current_page} of {Math.max(productsMeta.last_page, 1)}</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={productsPage <= 1 || productsLoading}
                    onClick={() => setProductsPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={productsPage >= productsMeta.last_page || productsLoading}
                    onClick={() => setProductsPage((prev) => Math.min(productsMeta.last_page || 1, prev + 1))}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar panel ── */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">

            {/* Panel mode tabs */}
            <div className="flex items-center gap-1.5 border-b border-gray-100 px-3 py-2.5">
              <button
                type="button"
                onClick={resetProductForm}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  productPanelMode === 'add' ? 'bg-[#2284DB] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                + Add product
              </button>
              {productPanelMode === 'edit' && (
                <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Editing
                </span>
              )}
              {productPanelMode === 'view' && viewingProduct && (
                <span className="max-w-[140px] truncate rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  {viewingProduct.name}
                </span>
              )}
              {(productPanelMode === 'edit' || productPanelMode === 'view') && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="ml-auto text-gray-400 hover:text-gray-700"
                  title="Close"
                >
                  <Icon icon="solar:close-circle-bold" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* ── VIEW DETAILS panel ── */}
            {productPanelMode === 'view' && viewingProduct && (() => {
              const vp = viewingProduct;
              const imgUrl = resolveAdminProductImageUrl(vp);
              const cat = vp.category_id ? categoryById.get(vp.category_id) : null;
              const parentName = cat?.parent_id ? categoryById.get(cat.parent_id)?.name : null;
              const catLabel = parentName ? `${parentName} · ${cat?.name || ''}` : cat?.name;
              const CONDITION_TEXT = { new: 'New', tokunbo: 'Tokunbo', nigerian_used: 'Nigerian Used' };
              const PART_TYPE_TEXT = { aftermarket: 'Aftermarket', oem: 'OEM', oes: 'OES' };
              return (
                <div className="space-y-4 p-4">
                  {/* Large image */}
                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4">
                    {imgUrl ? (
                      <img src={imgUrl} alt={vp.name} className="max-h-52 w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-300">
                        <Icon icon="solar:gallery-remove-bold-duotone" className="h-14 w-14" />
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Name + status */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-[#05243F]">{vp.name}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        vp.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {vp.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-gray-400">{vp.slug}</p>
                  </div>

                  {/* Price + stock */}
                  <div className="flex gap-4 rounded-xl bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">Price</p>
                      <p className="text-base font-bold text-[#2284DB]">{formatPrice(vp.inventory?.price_kobo)}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">Stock</p>
                      <p className="text-base font-bold text-[#05243F]">{vp.inventory?.stock_qty ?? 0}</p>
                    </div>
                  </div>

                  {/* Meta chips */}
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {catLabel && (
                      <div className="col-span-2 rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-gray-500">Category: </span>
                        <span className="font-medium text-gray-800">{catLabel}</span>
                      </div>
                    )}
                    {vp.brand && (
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-gray-500">Brand: </span>
                        <span className="font-medium text-gray-800">{vp.brand}</span>
                      </div>
                    )}
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-gray-500">Condition: </span>
                      <span className="font-medium text-gray-800">{CONDITION_TEXT[vp.condition] || vp.condition || '—'}</span>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <span className="text-gray-500">Type: </span>
                      <span className="font-medium text-gray-800">{PART_TYPE_TEXT[vp.part_type] || vp.part_type || '—'}</span>
                    </div>
                    {vp.inventory?.seller_label && (
                      <div className="rounded-lg bg-gray-50 px-3 py-2">
                        <span className="text-gray-500">Seller: </span>
                        <span className="font-medium text-gray-800">{vp.inventory.seller_label}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {vp.description && (
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Description</p>
                      <p className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">{vp.description}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        startEditProduct(vp);
                        setProductPanelMode('edit');
                        setViewingProduct(null);
                      }}
                      className="flex-1 rounded-lg border border-[#2284DB] py-2 text-xs font-semibold text-[#2284DB] hover:bg-[#2284DB] hover:text-white"
                    >
                      Edit product
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteProduct(vp.id);
                        setViewingProduct(null);
                        setProductPanelMode('add');
                      }}
                      className="flex-1 rounded-lg border border-rose-200 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* ── ADD / EDIT form ── */}
            {(productPanelMode === 'add' || productPanelMode === 'edit') && (
              <form onSubmit={handleSaveProduct} className="space-y-4 p-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500">
                    {productPanelMode === 'edit'
                      ? 'Update details or replace the main photo.'
                      : 'Creates a new listing in Ladipo.'}
                  </p>
                  {productPanelMode === 'add' && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-xs font-semibold text-gray-400 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</label>
                  <input
                    value={productForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setProductForm((prev) => {
                        const next = { ...prev, name };
                        if (!editingProductId && !slugManuallyEdited.current) {
                          next.slug = slugifyFromName(name);
                        }
                        return next;
                      });
                    }}
                    placeholder="e.g. Front brake pads"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">URL slug</label>
                    {!editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          slugManuallyEdited.current = false;
                          setProductForm((prev) => ({ ...prev, slug: slugifyFromName(prev.name) }));
                        }}
                        className="text-xs font-semibold text-[#2284DB] hover:underline"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                  <input
                    value={productForm.slug}
                    onChange={(e) => {
                      slugManuallyEdited.current = true;
                      setProductForm((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="unique-slug"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Category</label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, category_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                    required
                  >
                    <option value="">Select category</option>
                    {groupedCategories.map((category) => {
                      const parent = category.parent_id ? categoryById.get(category.parent_id) : null;
                      const label = parent ? `${parent.name} · ${category.name}` : category.name;
                      return (
                        <option key={category.id} value={category.id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Brand</label>
                  <input
                    value={productForm.brand}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Shown on the product page"
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Condition</label>
                    <select
                      value={productForm.condition}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, condition: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                    >
                      <option value="new">New</option>
                      <option value="tokunbo">Tokunbo</option>
                      <option value="nigerian_used">Nigerian used</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Part type</label>
                    <select
                      value={productForm.part_type}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, part_type: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                    >
                      <option value="aftermarket">Aftermarket</option>
                      <option value="oem">OEM</option>
                      <option value="oes">OES</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Price (naira)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price_naira}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, price_naira: e.target.value }))}
                      placeholder="e.g. 15000"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                      required
                    />
                    {priceKoboPreview && (
                      <p className="text-[11px] text-gray-500">
                        → <span className="font-semibold text-[#05243F]">{priceKoboPreview} kobo</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Stock qty</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.stock_qty}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, stock_qty: e.target.value }))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Seller label</label>
                  <input
                    value={productForm.seller_label}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, seller_label: e.target.value }))}
                    placeholder="Motoka"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2284DB] focus:ring-2 focus:ring-[#2284DB]/20"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.is_universal}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, is_universal: e.target.checked }))}
                    className="rounded border-gray-300 text-[#2284DB] focus:ring-[#2284DB]"
                  />
                  Universal part (shows for all cars)
                </label>

                {!productForm.is_universal && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Compatibility entries
                      </label>
                      {compatibilityLoading && <span className="text-[11px] text-gray-400">Loading…</span>}
                    </div>

                    {compatibilityEntries.length === 0 ? (
                      <p className="text-[11px] text-gray-500">No compatibility rows yet. Add at least one make/model/year range.</p>
                    ) : (
                      <div className="space-y-2">
                        {compatibilityEntries.map((entry) => (
                          <div key={entry.id} className="grid grid-cols-12 gap-2 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs">
                            <div className="col-span-3 font-medium text-gray-700">{entry.make || '—'}</div>
                            <div className="col-span-3 text-gray-600">{entry.model || 'All models'}</div>
                            <div className="col-span-2 text-gray-600">{entry.year_min ?? 'Any'}</div>
                            <div className="col-span-2 text-gray-600">{entry.year_max ?? 'Any'}</div>
                            <button
                              type="button"
                              onClick={() => removeCompatibilityEntry(entry.id)}
                              className="col-span-2 rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-12 gap-2">
                      <input
                        value={compatibilityDraft.make}
                        onChange={(e) => setCompatibilityDraft((prev) => ({ ...prev, make: e.target.value }))}
                        placeholder="Make"
                        className="col-span-3 rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-[#2284DB]"
                      />
                      <input
                        value={compatibilityDraft.model}
                        onChange={(e) => setCompatibilityDraft((prev) => ({ ...prev, model: e.target.value }))}
                        placeholder="Model (optional)"
                        className="col-span-3 rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-[#2284DB]"
                      />
                      <input
                        type="number"
                        value={compatibilityDraft.year_min}
                        onChange={(e) => setCompatibilityDraft((prev) => ({ ...prev, year_min: e.target.value }))}
                        placeholder="Year min"
                        className="col-span-2 rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-[#2284DB]"
                      />
                      <input
                        type="number"
                        value={compatibilityDraft.year_max}
                        onChange={(e) => setCompatibilityDraft((prev) => ({ ...prev, year_max: e.target.value }))}
                        placeholder="Year max"
                        className="col-span-2 rounded-lg border border-gray-200 px-2 py-2 text-xs outline-none focus:border-[#2284DB]"
                      />
                      <button
                        type="button"
                        onClick={addCompatibilityEntry}
                        className="col-span-2 rounded-lg bg-[#2284DB] px-2 py-2 text-xs font-semibold text-white hover:bg-[#1d74c3]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Image upload */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <label className="mb-2 block text-xs font-medium text-gray-700">Product image</label>
                  {productPanelMode === 'edit' && (
                    <p className="mb-2 text-[11px] text-gray-400">
                      New upload replaces the primary photo.
                    </p>
                  )}
                  <div className="flex gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                      {productImageObjectUrl ? (
                        <img src={productImageObjectUrl} alt="" className="max-h-full max-w-full object-contain" />
                      ) : editingProductCoverUrl ? (
                        <img src={editingProductCoverUrl} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Icon icon="solar:gallery-add-bold-duotone" className="h-8 w-8 text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        ref={productImageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => setProductImageFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-[#2284DB] file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#1d74c3]"
                      />
                      {productImageFile && (
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[11px] text-gray-500">{productImageFile.name}</p>
                          <button
                            type="button"
                            onClick={clearPendingProductImage}
                            className="shrink-0 text-[11px] font-semibold text-rose-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-[#2284DB] focus:ring-[#2284DB]"
                  />
                  Visible in Ladipo (active)
                </label>

                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="flex-1 rounded-lg bg-[#2284DB] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1d74c3] disabled:opacity-60"
                  >
                    {savingProduct ? 'Saving…' : productPanelMode === 'edit' ? 'Save changes' : 'Create product'}
                  </button>
                  {productPanelMode === 'edit' && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {selectedOrderNumber && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/35">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#05243F]">Order details</h2>
                <p className="text-sm text-gray-500">{selectedOrderNumber}</p>
              </div>
              <button
                onClick={closeOrderDetails}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            {selectedOrderLoading ? (
              <p className="py-8 text-sm text-gray-500">Loading order details...</p>
            ) : !selectedOrder ? (
              <p className="py-8 text-sm text-gray-500">Unable to load order details.</p>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-3 rounded-xl bg-gray-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Customer</p>
                    <p className="text-sm font-semibold text-[#05243F]">{selectedOrder.user_name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.user_email || 'No email'}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Totals</p>
                    <p className="text-sm text-gray-700">Subtotal: {formatPrice(selectedOrder.subtotal_kobo)}</p>
                    <p className="text-sm text-gray-700">Delivery: {formatPrice(selectedOrder.delivery_fee_kobo)}</p>
                    <p className="text-sm font-semibold text-[#05243F]">Total: {selectedOrder.total_naira}</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Items</h3>
                  <div className="space-y-2">
                    {(selectedOrder.items || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No items on this order.</p>
                    ) : (
                      (selectedOrder.items || []).map((item, index) => (
                        <div key={`${item.inventory_id || item.part_id || index}`} className="rounded-lg border border-gray-200 p-3">
                          <p className="text-sm font-semibold text-[#05243F]">{item.name || 'Item'}</p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity || 0} | Unit: {formatPrice(item.unit_price_kobo)} | Line total: {formatPrice(item.line_total_kobo)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid gap-3 rounded-xl border border-gray-200 p-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Delivery</h3>
                    <p className="text-sm text-gray-700">Method: {selectedOrder.delivery?.method || 'N/A'}</p>
                    <p className="text-sm text-gray-700">State: {selectedOrder.delivery?.state || 'N/A'}</p>
                    <p className="text-sm text-gray-700">LGA: {selectedOrder.delivery?.lga || 'N/A'}</p>
                    <p className="text-sm text-gray-700">Address: {selectedOrder.delivery?.address || 'N/A'}</p>
                    <p className="text-sm text-gray-700">Contact: {selectedOrder.delivery?.contact || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Timeline</h3>
                    <p className="text-sm text-gray-700">Created: {formatDateTime(selectedOrder.created_at)}</p>
                    <p className="text-sm text-gray-700">Paid: {formatDateTime(selectedOrder.paid_at)}</p>
                    <p className="text-sm text-gray-700">Updated: {formatDateTime(selectedOrder.updated_at)}</p>
                    <p className="text-sm text-gray-700">Order status: {formatAdminStatusLabel(selectedOrder, selectedOrder.order_status)}</p>
                    <p className="text-sm text-gray-700">Payment: {(selectedOrder.payment_status || '').replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-700">Handled by: {selectedOrder.handled_by_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Internal workflow</h3>
                  <p className="text-sm text-gray-700">
                    State:{' '}
                    <span className="font-semibold capitalize">
                      {selectedOrder.workflow_state === 'blocked' ? 'blocked' : 'active'}
                    </span>
                  </p>
                  {selectedOrder.workflow_state === 'blocked' && selectedOrder.block_reason && (
                    <p className="mt-1 text-sm text-gray-600">
                      Reason: {selectedOrder.block_reason}
                    </p>
                  )}
                  <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Block reason (required when marking blocked)
                  </label>
                  <textarea
                    value={blockReasonDraft}
                    onChange={(e) => setBlockReasonDraft(e.target.value)}
                    rows={2}
                    placeholder="e.g. Waiting on supplier / customer callback"
                    disabled={!workflowApiReady || !capabilitiesChecked}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        workflowSubmitting
                        || !workflowApiReady
                        || !capabilitiesChecked
                        || selectedOrder.workflow_state === 'blocked'
                      }
                      onClick={() => handleWorkflowUpdate('blocked', blockReasonDraft)}
                      className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mark blocked
                    </button>
                    <button
                      type="button"
                      disabled={
                        workflowSubmitting
                        || !workflowApiReady
                        || !capabilitiesChecked
                        || selectedOrder.workflow_state !== 'blocked'
                      }
                      onClick={() => handleWorkflowUpdate('active', '')}
                      className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Unblock
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Progress order</h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {!orderHandlerKey(selectedOrder) && (
                      <button
                        type="button"
                        disabled={!assigneeApiReady || !capabilitiesChecked || !handlerKeyForAdmin(adminDisplayName)}
                        onClick={() => claimOrder(selectedOrder.order_number)}
                        className="rounded-full border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Claim order
                      </button>
                    )}
                    {orderHandlerKey(selectedOrder) && orderHandlerKey(selectedOrder) !== handlerKeyForAdmin(adminDisplayName) && (
                      <button
                        type="button"
                        disabled={!assigneeApiReady || !capabilitiesChecked || !handlerKeyForAdmin(adminDisplayName)}
                        onClick={() => claimOrder(selectedOrder.order_number)}
                        className="rounded-full border border-amber-500 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reassign to me
                      </button>
                    )}
                    {orderHandlerKey(selectedOrder) && orderHandlerKey(selectedOrder) === handlerKeyForAdmin(adminDisplayName) && (
                      <button
                        type="button"
                        disabled={!assigneeApiReady || !capabilitiesChecked || !handlerKeyForAdmin(adminDisplayName)}
                        onClick={() => releaseOrder(selectedOrder.order_number)}
                        className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Release order
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(STATUS_PROGRESSIONS[selectedOrder.order_status] || []).map((nextStatus) => (
                      <button
                        key={nextStatus}
                        type="button"
                        onClick={() => handleOrderStatusUpdate(selectedOrder.order_number, nextStatus)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                          nextStatus === 'cancelled'
                            ? 'border-rose-300 text-rose-800 hover:bg-rose-50'
                            : 'border-[#2284DB] text-[#2284DB] hover:bg-[#2284DB] hover:text-white'
                        }`}
                      >
                        {formatNextActionLabel(selectedOrder, nextStatus)}
                      </button>
                    ))}
                    {(STATUS_PROGRESSIONS[selectedOrder.order_status] || []).length === 0 && (
                      <p className="text-sm text-gray-500">No further actions available for this status.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCancelReasonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#05243F]">Cancel order</h3>
            <p className="mt-1 text-sm text-gray-600">
              Provide a clear reason. This message will be sent to the customer via email and in-app notification.
            </p>
            <p className="mt-2 text-xs font-medium text-gray-500">
              Order: {cancelTargetOrderNumber}
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (at least 10 characters)..."
              rows={4}
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#2284DB] focus:outline-none focus:ring-2 focus:ring-[#2284DB]/20"
            />
            <p className="mt-2 text-xs text-gray-500">Minimum 10 characters. This text may be emailed to the customer.</p>

            {cancelOrderSnapshot && isHighValueOrder(cancelOrderSnapshot) && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p>
                  High-value order ({formatPrice(cancelOrderSnapshot.total_kobo)}). Type the order number exactly to
                  confirm cancellation.
                </p>
                <p className="mt-2 font-mono text-base font-bold tracking-tight">{cancelOrderSnapshot.order_number}</p>
                <input
                  type="text"
                  value={cancelConfirmTyping}
                  onChange={(e) => setCancelConfirmTyping(e.target.value)}
                  placeholder="Order number"
                  autoComplete="off"
                  className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2 border-t border-rose-100 bg-rose-50/60 pt-4">
              <button
                type="button"
                onClick={closeCancelReasonModal}
                disabled={cancelSubmitting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirmCancellation}
                disabled={cancelSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelSubmitting ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdminNameModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-[#05243F]">Set admin name</h3>
            <p className="mt-1 text-sm text-gray-600">
              This name is used for claim, release, and status actions to show who is handling each order.
            </p>

            <input
              value={adminNameDraft}
              onChange={(e) => setAdminNameDraft(e.target.value)}
              placeholder="Enter your name"
              className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[#2284DB] focus:outline-none focus:ring-2 focus:ring-[#2284DB]/20"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAdminNameModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAdminName}
                className="rounded-lg bg-[#2284DB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d74c3]"
              >
                Save name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
