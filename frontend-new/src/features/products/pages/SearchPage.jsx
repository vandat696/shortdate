import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
  CircularProgress,
  Grid,
} from '@mui/material';
import ProductCard from '../components/ProductCard';
import { productService } from '../../../services/api';

const DEFAULT_PRICE_RANGE = [0, 500_000];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get('q') || '').trim();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const [productType, setProductType] = useState(searchParams.get('product_type') || '');
  const [hsdPreset, setHsdPreset] = useState(searchParams.get('hsd') || 'today');
  const [discountPreset, setDiscountPreset] = useState(searchParams.get('discount') || '50-80');
  const [priceRange, setPriceRange] = useState(() => {
    const min = Number(searchParams.get('min_price'));
    const max = Number(searchParams.get('max_price'));
    if (Number.isFinite(min) && Number.isFinite(max)) return [min, max];
    return DEFAULT_PRICE_RANGE;
  });
  const [sort, setSort] = useState(searchParams.get('sort') || 'nearest_expiry');

  const queryParams = useMemo(() => {
    const params = {};
    if (productType) params.product_type = productType;

    // HSD presets map → min/max days left
    if (hsdPreset === 'today') {
      params.max_days_left = 0;
    } else if (hsdPreset === 'lt3') {
      params.max_days_left = 3;
    } else if (hsdPreset === 'lt7') {
      params.max_days_left = 7;
    } else if (hsdPreset === 'lt30') {
      params.max_days_left = 30;
    }

    // Discount presets map → min_discount
    if (discountPreset === '30-50') params.min_discount = 30;
    if (discountPreset === '50-80') params.min_discount = 50;
    if (discountPreset === '80+') params.min_discount = 80;

    params.min_price = priceRange[0];
    params.max_price = priceRange[1];

    // Sort mapping (backend supports sort+order by column; keep safe columns)
    if (sort === 'nearest_expiry') {
      params.sort = 'expiry_date';
      params.order = 'ASC';
    } else if (sort === 'highest_discount') {
      params.sort = 'discount_percentage';
      params.order = 'DESC';
    } else if (sort === 'lowest_price') {
      params.sort = 'current_price';
      params.order = 'ASC';
    } else if (sort === 'newest') {
      params.sort = 'created_at';
      params.order = 'DESC';
    }

    // Note: backend hiện chưa có full-text q; giữ q để UI, filter client-side
    return params;
  }, [productType, hsdPreset, discountPreset, priceRange, sort]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getAll(queryParams);
        let list = res.data?.products || res.data || [];
        if (!Array.isArray(list)) list = [];
        if (q) {
          const lower = q.toLowerCase();
          list = list.filter((p) => String(p?.name || '').toLowerCase().includes(lower));
        }
        setProducts(list);
      } catch (e) {
        setError(e?.response?.data?.error || e?.message || 'Không thể tải dữ liệu');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [q, queryParams]);

  const applyToUrl = () => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (productType) next.set('product_type', productType);
    next.set('hsd', hsdPreset);
    next.set('discount', discountPreset);
    next.set('min_price', String(priceRange[0]));
    next.set('max_price', String(priceRange[1]));
    next.set('sort', sort);
    setSearchParams(next, { replace: true });
  };

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Showing results{q ? ` for “${q}”` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          HSD Remaining • Discount • Product Type • Price Range • Sort
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>HSD Remaining</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'lt3', label: '< 3 days' },
                  { id: 'lt7', label: '< 7 days' },
                  { id: 'lt30', label: '< 30 days' },
                ].map((x) => (
                  <Chip
                    key={x.id}
                    label={x.label}
                    color={hsdPreset === x.id ? 'primary' : 'default'}
                    onClick={() => setHsdPreset(x.id)}
                    variant={hsdPreset === x.id ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>

              <Typography sx={{ fontWeight: 800, mb: 1 }}>Discount Range</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                {[
                  { id: '30-50', label: '30–50% Off' },
                  { id: '50-80', label: '50–80% Off' },
                  { id: '80+', label: 'Over 80% Off' },
                ].map((x) => (
                  <Chip
                    key={x.id}
                    label={x.label}
                    color={discountPreset === x.id ? 'primary' : 'default'}
                    onClick={() => setDiscountPreset(x.id)}
                    variant={discountPreset === x.id ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>

              <Typography sx={{ fontWeight: 800, mb: 1 }}>Product Type</Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="product-type-label">Type</InputLabel>
                <Select
                  labelId="product-type-label"
                  label="Type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="fresh_product">Local Fresh</MenuItem>
                  <MenuItem value="dry_product">Dry (National)</MenuItem>
                </Select>
              </FormControl>

              <Typography sx={{ fontWeight: 800, mb: 1 }}>Price Range</Typography>
              <Box sx={{ px: 1 }}>
                <Slider
                  value={priceRange}
                  onChange={(_, v) => setPriceRange(v)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500_000}
                  step={1000}
                />
                <Typography variant="body2" color="text.secondary">
                  {priceRange[0].toLocaleString('vi-VN')}đ — {priceRange[1].toLocaleString('vi-VN')}đ
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ fontWeight: 800, mb: 1 }}>Sort by</Typography>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="sort-label">Sort</InputLabel>
                <Select
                  labelId="sort-label"
                  label="Sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <MenuItem value="nearest_expiry">Nearest Expiry</MenuItem>
                  <MenuItem value="highest_discount">Highest Discount</MenuItem>
                  <MenuItem value="lowest_price">Lowest Price</MenuItem>
                  <MenuItem value="newest">Newest</MenuItem>
                </Select>
              </FormControl>

              <Button fullWidth variant="contained" onClick={applyToUrl}>
                Apply
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={9}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid key={product.id} item xs={12} sm={6} md={4}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
                {products.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 700 }}>No results</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting filters.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

