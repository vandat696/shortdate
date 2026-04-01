# Tài Liệu Đặc Tả Phần Mềm (SRS)
# ShortDate – Sàn Thương Mại Điện Tử Thực Phẩm Sắp Hết Hạn

**Phiên bản:** 1.0  
**Ngày:** 2025  
**Trạng thái:** Demo sinh viên

---

# 1. Giới Thiệu

## 1.1 Mục Đích Tài Liệu

Tài liệu này mô tả đầy đủ các yêu cầu chức năng, phi chức năng, kiến trúc kỹ thuật và chiến lược kiểm thử của hệ thống ShortDate. Đây là tài liệu tham chiếu chính cho nhóm phát triển, kiểm thử và các bên liên quan trong suốt vòng đời dự án.

## 1.2 Phạm Vi Hệ Thống

ShortDate là sàn thương mại điện tử chuyên biệt kết nối nhà cung cấp thực phẩm (Supplier) với người tiêu dùng (Buyer) trong lĩnh vực thực phẩm sắp hết hạn sử dụng. Hệ thống bao gồm:

- Nền tảng web cho Buyer, Supplier, Carrier và Admin
- Auto_Pricing_Engine tự động điều chỉnh giá theo HSD và tồn kho
- Hệ thống quản lý đơn hàng và giao hàng (nội thành + toàn quốc)
- Bảng điều khiển phân tích cho Supplier và Admin

Phiên bản hiện tại là **demo sinh viên**, triển khai trên nền tảng free tier với kiến trúc monolith đơn giản hóa.

## 1.3 Định Nghĩa và Thuật Ngữ

| Thuật ngữ | Định nghĩa |
|---|---|
| ShortDate_Platform | Toàn bộ hệ thống sàn thương mại điện tử ShortDate |
| Buyer | Người tiêu dùng đã đăng ký tài khoản và mua hàng trên sàn |
| Supplier | Nhà cung cấp (siêu thị, cửa hàng, nhà sản xuất) đã đăng ký bán hàng |
| Admin | Quản trị viên hệ thống ShortDate |
| Carrier | Đơn vị vận chuyển có tài khoản trên hệ thống, chịu trách nhiệm nhận và giao hàng |
| Product | Sản phẩm thực phẩm được niêm yết trên sàn, có thông tin HSD rõ ràng |
| Dry_Product | Thực phẩm khô/đóng gói còn HSD từ 30 đến 90 ngày |
| Fresh_Product | Đồ ăn tươi/tiêu dùng trong ngày với HSD từ 0 đến 1 ngày |
| Bundle | Gói sản phẩm theo mô hình "Túi giá" (Mini, Tiêu chuẩn, Gia đình, Premium) |
| Auto_Pricing_Engine | Thuật toán tự động điều chỉnh giá dựa trên HSD và tồn kho |
| AI_Pricing_Module | Mô-đun AI/ML kết hợp Computer Vision (tính năng tương lai) |
| Product_Risk_Score | Điểm rủi ro sản phẩm (0–100), phản ánh khả năng không bán được trước HSD |
| Flash_Sale | Chương trình giảm giá sâu trong thời gian giới hạn (tối đa 24 giờ) |
| Supplier_Dashboard | Bảng điều khiển quản lý tồn kho và hiệu suất kinh doanh của Supplier |
| 3PL | Carrier bên thứ ba phục vụ giao hàng toàn quốc cho Dry_Product |
| HSD | Hạn sử dụng (ngày hết hạn) của sản phẩm |
| Order | Đơn hàng được tạo khi Buyer xác nhận mua Product/Bundle |
| Notification_Service | Dịch vụ gửi thông báo (push, email, SMS) đến người dùng |

## 1.4 Tổng Quan Tài Liệu

- **Mục 2**: Mô tả tổng quan hệ thống, bối cảnh và các actor
- **Mục 3**: Yêu cầu chức năng (15 yêu cầu)
- **Mục 4**: Yêu cầu phi chức năng
- **Mục 5**: Kiến trúc kỹ thuật và mô hình dữ liệu
- **Mục 6**: Luồng nghiệp vụ chính
- **Mục 7**: Chiến lược kiểm thử
- **Mục 8**: Hạn chế và hướng mở rộng

---

# 2. Mô Tả Tổng Quan Hệ Thống

## 2.1 Bối Cảnh và Vấn Đề Giải Quyết

Lãng phí thực phẩm là vấn đề kinh tế và môi trường nghiêm trọng. Các nhà cung cấp thường phải tiêu hủy hoặc bán lỗ hàng tồn kho sắp hết hạn vì thiếu kênh phân phối hiệu quả. Người tiêu dùng, ngược lại, không có cách dễ dàng để tìm mua thực phẩm chất lượng với giá ưu đãi.

ShortDate giải quyết bài toán này bằng cách:
- Cung cấp kênh thanh lý hàng tồn cho Supplier với doanh thu tối ưu hơn tiêu hủy
- Giúp Buyer mua thực phẩm chất lượng với giá thấp hơn 30–80% giá gốc
- Tự động hóa định giá theo thời gian thực để tối đa hóa tỷ lệ bán hết trước HSD

## 2.2 Các Actor và Vai Trò

**Buyer** – Người mua hàng
- Tìm kiếm, lọc và mua sản phẩm/bundle
- Theo dõi đơn hàng và đánh giá sau khi nhận hàng
- Tham gia Flash Sale và nhận thông báo ưu đãi

**Supplier** – Nhà cung cấp
- Niêm yết và quản lý sản phẩm, bundle
- Cấu hình Auto_Pricing_Engine cho từng sản phẩm
- Xác nhận đơn hàng và bàn giao cho Carrier
- Theo dõi hiệu suất kinh doanh qua Supplier_Dashboard

**Carrier** – Đơn vị vận chuyển
- Nhận đơn hàng được phân công
- Cập nhật trạng thái giao hàng kèm hình ảnh xác nhận
- Xem tổng quan hiệu suất giao hàng

**Admin** – Quản trị viên
- Xét duyệt tài khoản Supplier và Carrier
- Tạo và quản lý Flash Sale
- Kiểm duyệt sản phẩm, khóa tài khoản vi phạm
- Giám sát toàn bộ hoạt động sàn qua audit log

## 2.3 Kiến Trúc Tổng Thể

ShortDate áp dụng kiến trúc **monolith** phù hợp với quy mô demo:

| Thành phần | Công nghệ | Nền tảng triển khai |
|---|---|---|
| Frontend | React (JavaScript) | Vercel (free) |
| Backend | Node.js + Express (REST API) | Render / Railway (free) |
| Database | PostgreSQL | Supabase (free tier) |
| File Storage | Supabase Storage | Supabase (free tier) |

Backend được tổ chức thành các module độc lập: Auth, Product, Pricing, Search, Order, Delivery, Carrier, Notification, Dashboard, Ad, Review, Admin.

## 2.4 Ràng Buộc Hệ Thống

- **Free tier constraints**: Supabase giới hạn kết nối đồng thời và dung lượng lưu trữ; Render/Railway có thể cold start sau thời gian không hoạt động.
- **Không có TypeScript**: Toàn bộ codebase sử dụng JavaScript thuần để đơn giản hóa.
- **Xử lý đồng bộ**: Không có message broker; notification và pricing update được xử lý đồng bộ trong request hoặc qua cron job.
- **Phạm vi demo**: Một số tính năng (AI/ML, Kafka, Elasticsearch, Redis) được thiết kế nhưng chưa triển khai trong phiên bản này.

---

# 3. Yêu Cầu Chức Năng

## YC-01: Quản Lý Tài Khoản Người Dùng

**Actor:** Buyer, Supplier, Carrier, Admin  
**Mô tả:** Hệ thống hỗ trợ đăng ký, xác minh và quản lý tài khoản cho tất cả loại người dùng.

**Tiêu chí chấp nhận chính:**
- Đăng ký bằng email/số điện thoại + mật khẩu, hoặc OAuth (Google/Facebook)
- Gửi email/SMS xác minh trong vòng 60 giây sau đăng ký
- Tài khoản chưa xác minh chỉ được xem sản phẩm, không thể đặt hàng
- Khóa tài khoản 15 phút sau 5 lần nhập sai mật khẩu liên tiếp
- Tài khoản Supplier và Carrier phải được Admin phê duyệt trước khi sử dụng

## YC-02: Niêm Yết và Quản Lý Sản Phẩm

**Actor:** Supplier  
**Mô tả:** Supplier đăng sản phẩm với đầy đủ thông tin HSD, giá và tồn kho; hệ thống cảnh báo khi HSD hoặc tồn kho thấp.

**Tiêu chí chấp nhận chính:**
- Bắt buộc: tên, hình ảnh, danh mục, HSD, tồn kho, giá gốc, giá bán
- Từ chối lưu nếu thiếu trường bắt buộc, hiển thị danh sách trường còn thiếu
- Cảnh báo Supplier khi HSD còn dưới 7 ngày hoặc tồn kho dưới ngưỡng tối thiểu
- Cảnh báo xác nhận khi Dry_Product có HSD ngoài khoảng 30–90 ngày

## YC-03: Mô Hình Gói Giá (Bundle)

**Actor:** Supplier, Buyer  
**Mô tả:** Supplier tạo gói sản phẩm theo 4 mức giá cố định; hệ thống đảm bảo giá trị thực luôn cao hơn giá bán tối thiểu 30%.

**Tiêu chí chấp nhận chính:**
- 4 loại: Túi Mini (15–25k), Tiêu chuẩn (30–50k), Gia đình (99–149k), Premium (199–299k)
- Từ chối lưu nếu giá bán không thấp hơn giá trị thực tối thiểu 30%
- Tự động ẩn Bundle và thông báo Supplier khi có Product trong Bundle hết hàng

## YC-04: Auto-Pricing Engine

**Actor:** Supplier (cấu hình), Hệ thống (tự động)  
**Mô tả:** Engine tự động điều chỉnh giá theo chu kỳ ≤ 1 giờ dựa trên HSD còn lại và tỷ lệ tồn kho.

**Tiêu chí chấp nhận chính:**
- Giảm giá ≥ 50% khi HSD còn dưới 24 giờ
- Tăng chiết khấu thêm ≥ 10% khi tồn kho > 80% sau 50% thời gian từ nhập kho đến HSD
- Giá sau điều chỉnh không bao giờ thấp hơn floor_price do Supplier thiết lập
- Ghi đầy đủ lịch sử thay đổi giá (thời điểm, giá cũ, giá mới, lý do)
- Supplier có thể bật/tắt engine cho từng sản phẩm riêng lẻ

## YC-05: AI-Powered Pricing Module

**Actor:** Supplier  
**Mô tả:** Mô-đun AI phân tích hình ảnh và dữ liệu để tính Product_Risk_Score và đề xuất giá tối ưu.

**Tiêu chí chấp nhận chính:**
- Phân tích hình ảnh trong vòng 10 giây sau khi tải lên
- Risk Score ≥ 70 → đề xuất chiết khấu ≥ 40%; Risk Score < 30 → đề xuất 10–20%
- Supplier có thể chấp nhận hoặc điều chỉnh giá đề xuất trước khi niêm yết
- Cập nhật mô hình dự đoán mỗi 24 giờ dựa trên dữ liệu giao dịch thực tế

> Lưu ý: Trong phiên bản demo, AI_Pricing_Module chưa được triển khai. Risk Score được tính bằng công thức toán học đơn giản (xem Mục 5.2).

## YC-06: Tìm Kiếm và Lọc Sản Phẩm

**Actor:** Buyer  
**Mô tả:** Buyer tìm kiếm sản phẩm theo từ khóa và lọc theo nhiều tiêu chí; kết quả trả về trong ≤ 2 giây.

**Tiêu chí chấp nhận chính:**
- Tìm kiếm full-text theo tên sản phẩm, kết quả trong ≤ 2 giây
- Bộ lọc: HSD còn lại, danh mục, khu vực, mức giảm giá, khoảng giá, loại sản phẩm
- Sắp xếp theo: HSD gần nhất, giảm giá cao nhất, giá thấp nhất, mới nhất
- Gợi ý sản phẩm dựa trên lịch sử xem và mua hàng của Buyer

## YC-07: Flash Sale và Deal Theo Ngày

**Actor:** Admin (tạo), Buyer (tham gia)  
**Mô tả:** Admin tạo chương trình Flash Sale; hệ thống tự động áp dụng và khôi phục giá đúng thời điểm.

**Tiêu chí chấp nhận chính:**
- Flash Sale tối đa 24 giờ; giá Flash Sale được áp dụng/khôi phục tự động
- Hiển thị đồng hồ đếm ngược và trạng thái "Hết hàng" khi cần
- Trang "Deal Hôm Nay" tổng hợp sản phẩm giảm ≥ 30%
- Gửi thông báo push đến Buyer đã đăng ký trước 30 phút khi Flash Sale bắt đầu

## YC-08: Giỏ Hàng và Đặt Hàng

**Actor:** Buyer  
**Mô tả:** Buyer thêm sản phẩm vào giỏ (không cần đăng nhập) và hoàn tất đặt hàng với nhiều phương thức thanh toán.

**Tiêu chí chấp nhận chính:**
- Giỏ hàng ẩn danh; yêu cầu đăng nhập khi thanh toán
- Giới hạn số lượng trong giỏ không vượt quá tồn kho hiện có
- Cập nhật giá trong giỏ khi Auto_Pricing_Engine thay đổi giá
- Tạo Order với mã duy nhất, gửi xác nhận trong ≤ 60 giây
- Trừ tồn kho ngay lập tức khi xác nhận đặt hàng
- Hỗ trợ: MoMo, ZaloPay, VNPay, ATM, Visa/Mastercard, COD

## YC-09: Giao Hàng

**Actor:** Buyer, Supplier, Carrier  
**Mô tả:** Hệ thống điều phối giao hàng nhanh nội thành (Fresh_Product) và toàn quốc qua 3PL (Dry_Product).

**Tiêu chí chấp nhận chính:**
- Fresh_Product: giao nhanh nội thành trong 4 giờ; chỉ hiển thị tùy chọn này cho đơn có Fresh_Product
- Dry_Product: giao toàn quốc qua 3PL trong 1–5 ngày làm việc
- Theo dõi trạng thái giao hàng theo thời gian thực; thông báo khi trạng thái thay đổi
- Luồng trạng thái: chuẩn bị → bàn giao Carrier → đang lấy → đang giao → đã giao / giao thất bại
- Nhận cập nhật tự động từ 3PL qua webhook cho Dry_Product

## YC-10: Quản Lý Vận Chuyển (Carrier)

**Actor:** Carrier  
**Mô tả:** Carrier có công cụ nhận đơn, cập nhật trạng thái và xem hiệu suất giao hàng.

**Tiêu chí chấp nhận chính:**
- Xem danh sách đơn được phân công kèm địa chỉ, loại sản phẩm, thời hạn giao
- Cập nhật trạng thái kèm hình ảnh xác nhận (bắt buộc khi cập nhật "đã giao")
- Carrier chỉ cập nhật được đơn hàng được phân công cho mình
- Lên lịch giao lại trong 24 giờ khi giao thất bại
- Trang tổng quan: số đơn đang xử lý, đã giao thành công, tỷ lệ thành công

## YC-11: Supplier Dashboard

**Actor:** Supplier  
**Mô tả:** Bảng điều khiển cung cấp dữ liệu phân tích kinh doanh và công cụ quản lý tồn kho, giá.

**Tiêu chí chấp nhận chính:**
- Tổng quan doanh thu, đơn hàng, tỷ lệ bán hết theo ngày/tuần/tháng
- Danh sách sản phẩm sắp hết HSD (< 7 ngày) kèm tồn kho
- Cấu hình Auto_Pricing_Engine: floor_price, mức giảm tối đa, ngưỡng kích hoạt
- Biểu đồ lịch sử giá và tương quan với lượng bán
- Huy hiệu "Nhà cung cấp xuất sắc" khi tỷ lệ bán hết trước HSD đạt > 90%/tháng

## YC-12: Quảng Cáo Nội Sàn

**Actor:** Supplier  
**Mô tả:** Supplier tạo chiến dịch quảng cáo với ngân sách và vị trí hiển thị trên sàn.

**Tiêu chí chấp nhận chính:**
- Vị trí quảng cáo: banner trang chủ, nổi bật trong tìm kiếm, gợi ý được tài trợ
- Tự động dừng chiến dịch khi hết ngân sách, gửi thông báo đến Supplier
- Phân biệt rõ sản phẩm quảng cáo bằng nhãn "Tài trợ"
- Báo cáo hiệu suất: lượt hiển thị, lượt nhấp, tỷ lệ chuyển đổi, CPC

## YC-13: Đánh Giá và Phản Hồi

**Actor:** Buyer  
**Mô tả:** Buyer đánh giá sản phẩm và Supplier sau khi nhận hàng thành công.

**Tiêu chí chấp nhận chính:**
- Chỉ cho phép đánh giá trong 7 ngày sau khi đơn hàng được giao thành công
- Bắt buộc: điểm 1–5 sao, nhận xét ≥ 10 ký tự; tùy chọn: hình ảnh thực tế
- Thông báo Supplier khi nhận đánh giá dưới 3 sao
- Admin nhận cảnh báo khi rating trung bình Supplier < 3.0 trong 30 ngày liên tiếp

## YC-14: Quản Lý Admin

**Actor:** Admin  
**Mô tả:** Admin có đầy đủ công cụ quản lý người dùng, sản phẩm, Flash Sale và giám sát hệ thống.

**Tiêu chí chấp nhận chính:**
- Xét duyệt Supplier/Carrier trong 48 giờ làm việc; gửi kết quả trong ≤ 60 giây
- Tạo, chỉnh sửa, hủy Flash Sale (chỉ kết thúc sớm khi đã bắt đầu)
- Khóa/mở khóa tài khoản và sản phẩm vi phạm; ghi audit log mọi hành động
- Trang tổng quan: doanh thu toàn sàn, số Supplier/Buyer hoạt động, đơn hàng theo trạng thái

## YC-15: Bảo Mật và Tuân Thủ

**Actor:** Tất cả người dùng  
**Mô tả:** Hệ thống bảo vệ dữ liệu người dùng và giao dịch theo tiêu chuẩn bảo mật.

**Tiêu chí chấp nhận chính:**
- Mã hóa toàn bộ dữ liệu truyền tải bằng TLS 1.2+
- Mã hóa thông tin thanh toán và dữ liệu nhạy cảm khi lưu trữ
- Yêu cầu OTP khi phát hiện đăng nhập bất thường (thiết bị/địa điểm mới)
- Lưu audit log cho mọi thao tác quan trọng: đăng nhập, thay đổi giá, tạo/hủy đơn hàng
- Tuân thủ quy định bảo vệ dữ liệu cá nhân theo pháp luật Việt Nam

---

# 4. Yêu Cầu Phi Chức Năng

## 4.1 Hiệu Năng

| Chỉ số | Yêu cầu |
|---|---|
| Thời gian phản hồi tìm kiếm | ≤ 2 giây |
| Gửi xác nhận đơn hàng | ≤ 60 giây sau khi đặt hàng |
| Gửi email/SMS xác minh | ≤ 60 giây sau đăng ký |
| Phân tích hình ảnh (AI module) | ≤ 10 giây |
| Chu kỳ cập nhật giá (Auto_Pricing_Engine) | ≤ 1 giờ |
| Cập nhật kết quả tìm kiếm khi lọc | Không cần tải lại trang |

## 4.2 Bảo Mật

- Giao thức TLS 1.2+ cho toàn bộ kết nối client–server
- Mã hóa mật khẩu bằng bcrypt; mã hóa dữ liệu nhạy cảm khi lưu trữ
- JWT access token + refresh token cho xác thực phiên
- OTP bổ sung khi phát hiện đăng nhập bất thường
- Rate limiting để ngăn brute force
- Audit log đầy đủ cho mọi thao tác quan trọng
- Không expose stack trace trong response lỗi production
- Lỗi API theo chuẩn RFC 7807 (Problem Details for HTTP APIs)

## 4.3 Khả Dụng

- Phiên bản demo chạy trên free tier; có thể xảy ra cold start trên Render/Railway sau thời gian không hoạt động
- Supabase free tier giới hạn số kết nối đồng thời và dung lượng lưu trữ
- Circuit breaker cho external calls (Payment Gateway, 3PL, SMS/Email): sau 5 lỗi liên tiếp trong 60 giây, trả về fallback response
- Retry tối đa 3 lần với exponential backoff cho external API calls
- Graceful degradation: nếu Payment Gateway không khả dụng, cho phép chọn phương thức thanh toán khác

## 4.4 Khả Năng Mở Rộng

Kiến trúc hiện tại được thiết kế để dễ nâng cấp khi scale lên production:

| Thành phần hiện tại | Hướng nâng cấp |
|---|---|
| Xử lý đồng bộ trong request | Kafka / Message Broker (event-driven) |
| PostgreSQL full-text search | Elasticsearch (faceted search, relevance scoring) |
| Công thức toán học (pricing) | AI/ML Pricing Module (Computer Vision + ML) |
| JWT + bảng carts PostgreSQL | Redis (session, cart, rate limiting, cache) |
| Monolith Express | Microservices (scale từng module độc lập) |
| Bảng price_history PostgreSQL | TimescaleDB (time-series queries hiệu quả hơn) |
| Web app | React Native Mobile App |

---

# 5. Kiến Trúc Kỹ Thuật

## 5.1 Stack Công Nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React, JavaScript (không TypeScript), Vite |
| Backend | Node.js, Express.js, JavaScript |
| Database | PostgreSQL (Supabase) |
| File Storage | Supabase Storage |
| Authentication | JWT (access + refresh token), OAuth (Google/Facebook) |
| Testing | Jest, fast-check (property-based testing) |
| CI/CD | GitHub Actions |
| Deploy Frontend | Vercel |
| Deploy Backend | Render / Railway |

## 5.2 Các Module Chính

| Module | Trách nhiệm chính |
|---|---|
| Auth | Đăng ký, đăng nhập, OAuth, OTP, xét duyệt Supplier/Carrier |
| Product | CRUD sản phẩm, bundle, quản lý tồn kho, cảnh báo HSD |
| Pricing | Auto_Pricing_Engine (cron job), Flash Sale, lịch sử giá |
| Search | Full-text search (PostgreSQL tsvector), lọc, sắp xếp, gợi ý |
| Order | Giỏ hàng, tạo đơn hàng, tích hợp thanh toán |
| Delivery | Điều phối giao hàng Fresh (nội thành) và Dry (3PL) |
| Carrier | Nhận đơn, cập nhật trạng thái, dashboard Carrier |
| Notification | Gửi email/SMS/push (đồng bộ hoặc cron job) |
| Dashboard | Báo cáo phân tích cho Supplier (query tổng hợp PostgreSQL) |
| Ad | Quản lý chiến dịch quảng cáo nội sàn |
| Review | Đánh giá sản phẩm và Supplier |
| Admin | Quản lý người dùng, sản phẩm, audit log, tổng quan hệ thống |

**Auto_Pricing_Engine – Công thức tính giá:**

```
Dry_Product:
  timeScore  = max(0, 1 - daysLeft / 90) × 60
  stockScore = stockRatio × 40
  riskScore  = timeScore + stockScore

Fresh_Product:
  timeScore  = max(0, 1 - daysLeft / 1) × 70
  stockScore = stockRatio × 30
  riskScore  = timeScore + stockScore

Discount:
  riskScore ≥ 70  → discount = min(80%, 40% + (riskScore - 70) × 1%)
  riskScore ≥ 30  → discount = 10% + (riskScore - 30) × 0.75%
  riskScore < 30  → discount = 10%

Điều chỉnh thêm:
  daysLeft < 1                              → discount = max(discount, 50%)
  stockRatio > 0.8 và đã qua 50% thời gian → discount += 10%

Giá cuối = max(floor_price, originalPrice × (1 - discount))
```

## 5.3 Mô Hình Dữ Liệu Tóm Tắt

**Các bảng chính và quan hệ:**

| Bảng | Mô tả | Quan hệ chính |
|---|---|---|
| `users` | Tài khoản tất cả loại người dùng (role: buyer/supplier/carrier/admin) | 1–1 với supplier_profiles, carrier_profiles |
| `supplier_profiles` | Thông tin doanh nghiệp Supplier, trạng thái xét duyệt, rating | 1–N với products, bundles |
| `carrier_profiles` | Thông tin Carrier, khu vực hoạt động, tỷ lệ thành công | 1–N với orders |
| `products` | Sản phẩm: HSD, tồn kho, giá gốc, giá hiện tại, floor_price, loại (dry/fresh) | N–1 với supplier_profiles |
| `bundles` | Gói sản phẩm theo 4 loại; tự động ẩn khi hết hàng | N–N với products qua bundle_items |
| `price_history` | Lịch sử thay đổi giá: thời điểm, giá cũ, giá mới, lý do | N–1 với products |
| `carts` | Giỏ hàng (hỗ trợ ẩn danh qua session_token) | N–1 với users |
| `orders` | Đơn hàng: mã duy nhất, trạng thái, phương thức thanh toán, địa chỉ giao | N–1 với users, carrier_profiles |
| `order_items` | Chi tiết đơn hàng: sản phẩm/bundle, số lượng, giá tại thời điểm đặt | N–1 với orders, products, bundles |
| `flash_sales` | Chương trình Flash Sale: thời gian, trạng thái | 1–N với flash_sale_items |
| `flash_sale_items` | Sản phẩm tham gia Flash Sale và giá Flash Sale | N–1 với products |
| `reviews` | Đánh giá: rating, comment, hình ảnh | N–1 với orders, products, supplier_profiles |
| `ad_campaigns` | Chiến dịch quảng cáo: ngân sách, vị trí, trạng thái | N–1 với supplier_profiles |
| `audit_logs` | Nhật ký thao tác quan trọng: action, payload, IP, timestamp | N–1 với users |

**Ghi chú lưu trữ:**
- Search: PostgreSQL `tsvector`/`tsquery` với index GIN (thay vì Elasticsearch)
- Cart ẩn danh: `session_token` trong cookie, lưu trong bảng `carts`
- Hình ảnh: Supabase Storage

## 5.4 Tích Hợp Bên Ngoài

| Dịch vụ | Mục đích | Ghi chú |
|---|---|---|
| Payment Gateway (MoMo, ZaloPay, VNPay) | Xử lý thanh toán ví điện tử và thẻ | Circuit breaker + retry |
| 3PL APIs | Giao hàng toàn quốc cho Dry_Product; nhận webhook cập nhật trạng thái | Webhook endpoint |
| Google / Facebook OAuth | Đăng nhập xã hội | OAuth 2.0 |
| SMS Provider | Gửi OTP xác minh và thông báo | Đồng bộ hoặc cron job |
| Email Provider | Gửi xác nhận đơn hàng, cảnh báo, thông báo | Đồng bộ hoặc cron job |
| Supabase Storage | Lưu trữ hình ảnh sản phẩm và xác nhận giao hàng | S3-compatible API |

---

# 6. Luồng Nghiệp Vụ Chính

## 6.1 Luồng Đăng Ký và Xác Minh Tài Khoản

1. Người dùng điền thông tin đăng ký (email/phone + password) hoặc chọn OAuth
2. Hệ thống kiểm tra trùng lặp; nếu trùng → trả lỗi 409
3. Tạo tài khoản với trạng thái `unverified`; gửi email/SMS OTP trong ≤ 60 giây
4. Người dùng nhập OTP → tài khoản chuyển sang `verified`
5. Với Supplier/Carrier: nộp thêm hồ sơ doanh nghiệp → Admin xét duyệt trong 48 giờ → gửi kết quả qua email

## 6.2 Luồng Niêm Yết Sản Phẩm và Định Giá Tự Động

1. Supplier điền thông tin sản phẩm (tên, hình ảnh, HSD, tồn kho, giá gốc, floor_price)
2. Hệ thống validate; nếu thiếu trường bắt buộc → trả lỗi kèm danh sách trường thiếu
3. Supplier bật Auto_Pricing_Engine và cấu hình floor_price, mức giảm tối đa
4. Cron job chạy mỗi ≤ 1 giờ: tính riskScore → tính discount → cập nhật current_price
5. Mỗi lần thay đổi giá → ghi bản ghi vào `price_history`
6. Khi HSD < 7 ngày hoặc tồn kho < ngưỡng → gửi cảnh báo đến Supplier

## 6.3 Luồng Mua Hàng

1. Buyer tìm kiếm/lọc sản phẩm → xem chi tiết
2. Thêm Product/Bundle vào giỏ hàng (không cần đăng nhập)
3. Tiến hành thanh toán → yêu cầu đăng nhập nếu chưa có phiên
4. Xem tổng đơn hàng (subtotal + phí vận chuyển + total)
5. Chọn phương thức thanh toán → xác nhận đặt hàng
6. Hệ thống: trừ tồn kho ngay lập tức → tạo Order với mã duy nhất → gửi xác nhận ≤ 60 giây

## 6.4 Luồng Giao Hàng

**Fresh_Product (nội thành):**
1. Supplier xác nhận đơn → cập nhật "đang chuẩn bị hàng" → "đã bàn giao Carrier"
2. Hệ thống thông báo Carrier được phân công
3. Carrier cập nhật: "đang lấy hàng" → "đang giao" → "đã giao" (kèm ảnh xác nhận bắt buộc)
4. Buyer nhận thông báo mỗi khi trạng thái thay đổi

**Dry_Product (toàn quốc qua 3PL):**
1. Supplier bàn giao cho 3PL → hệ thống nhận webhook cập nhật trạng thái tự động
2. Trạng thái được đồng bộ vào hệ thống theo dõi đơn hàng
3. Buyer theo dõi trạng thái theo thời gian thực

## 6.5 Luồng Quản Trị Admin

1. Admin xét duyệt hồ sơ Supplier/Carrier mới (phê duyệt/từ chối kèm lý do)
2. Admin tạo Flash Sale → hệ thống tự động kích hoạt/kết thúc đúng thời điểm
3. Admin nhận cảnh báo khi Supplier có rating < 3.0 trong 30 ngày → xem xét và xử lý
4. Admin kiểm duyệt sản phẩm → khóa sản phẩm vi phạm → ẩn khỏi sàn + thông báo Supplier + ghi audit log
5. Admin tra cứu audit log theo thời gian, loại thao tác, tài khoản

---

# 7. Chiến Lược Kiểm Thử

## 7.1 Unit và Integration Tests

Tập trung vào:
- Happy path cho từng module (đăng ký, đặt hàng, cập nhật giá,...)
- Edge cases: HSD = 0, stock = 0, giá = floor_price, giỏ hàng rỗng
- Điểm tích hợp giữa module: Order → Inventory, Pricing → Notification
- Lỗi từ external services: Payment Gateway timeout, 3PL API lỗi

Môi trường: PostgreSQL test database (Supabase local hoặc Docker), chạy trong CI pipeline với mỗi PR.

## 7.2 Property-Based Tests (fast-check)

**Thư viện:** `fast-check` (Node.js/JavaScript)  
**Cấu hình:** Mỗi property test chạy tối thiểu 100 iterations  
**Convention:** Mỗi test có comment tham chiếu:
```
// Feature: short-date, Property {N}: {mô tả property}
```

## 7.3 Danh Sách 29 Correctness Properties

| # | Property | Module |
|---|---|---|
| P1 | Đăng ký với dữ liệu hợp lệ luôn thành công | Auth |
| P2 | Không cho phép đăng ký trùng email/phone | Auth |
| P3 | Tài khoản chưa xác minh bị giới hạn quyền truy cập | Auth |
| P4 | Khóa tài khoản sau 5 lần nhập sai mật khẩu | Auth |
| P5 | Validation đầy đủ khi niêm yết sản phẩm | Product |
| P6 | Cảnh báo HSD sắp hết (< 7 ngày) cho Supplier | Product |
| P7 | Cảnh báo khi Dry_Product có HSD ngoài khoảng 30–90 ngày | Product |
| P8 | Auto_Pricing_Engine áp dụng giảm giá ≥ 50% khi HSD < 24 giờ | Pricing |
| P9 | Auto_Pricing_Engine tăng chiết khấu khi tồn kho cao và thời gian cạn | Pricing |
| P10 | Giá sau điều chỉnh không bao giờ thấp hơn floor_price | Pricing |
| P11 | Lịch sử giá được ghi lại đầy đủ sau mỗi thay đổi | Pricing |
| P12 | Product_Risk_Score luôn nằm trong khoảng [0, 100] | Pricing |
| P13 | Mapping Risk Score → mức chiết khấu đề xuất đúng ngưỡng | Pricing |
| P14 | Giá trị thực trong Bundle luôn cao hơn giá bán tối thiểu 30% | Product |
| P15 | Bundle tự động ẩn khi có Product hết hàng | Product |
| P16 | Kết quả tìm kiếm thỏa mãn tất cả bộ lọc đã áp dụng | Search |
| P17 | Kết quả tìm kiếm được sắp xếp đúng theo tiêu chí | Search |
| P18 | Flash Sale áp dụng đúng giá khi kích hoạt | Pricing |
| P19 | Giá được khôi phục sau khi Flash Sale kết thúc | Pricing |
| P20 | Số lượng trong giỏ hàng không vượt quá tồn kho | Order |
| P21 | Mã đơn hàng là duy nhất trong toàn hệ thống | Order |
| P22 | Tồn kho giảm đúng số lượng sau khi đặt hàng | Order |
| P23 | Đơn hàng chứa Fresh_Product chỉ cho phép giao hàng nhanh nội thành | Delivery |
| P24 | Review chỉ được tạo trong 7 ngày sau khi giao hàng thành công | Review |
| P25 | Validation nội dung đánh giá (rating 1–5, comment ≥ 10 ký tự) | Review |
| P26 | Audit log được ghi cho mọi thao tác quan trọng | Auth/Order/Pricing |
| P27 | Carrier chỉ cập nhật được đơn hàng được phân công cho mình | Carrier |
| P28 | Ảnh xác nhận bắt buộc khi Carrier cập nhật trạng thái "đã giao" | Carrier |
| P29 | Admin lock product → product không xuất hiện trong search results | Search/Admin |

---

# 8. Hạn Chế và Hướng Mở Rộng

## 8.1 Hạn Chế Phiên Bản Demo

Các tính năng được thiết kế trong spec nhưng chưa triển khai trong phiên bản demo:

- **AI/ML Pricing Module**: Chưa có Computer Vision và mô hình ML. Risk Score được tính bằng công thức toán học đơn giản.
- **Kafka / Message Broker**: Notification và pricing update xử lý đồng bộ, không có event-driven architecture.
- **Elasticsearch**: Tìm kiếm dùng PostgreSQL `tsvector`; không hỗ trợ faceted search hay relevance scoring nâng cao.
- **Redis**: Không có cache layer; session và giỏ hàng lưu trong PostgreSQL.
- **Microservices**: Toàn bộ backend là monolith Express; không thể scale từng module độc lập.
- **TimescaleDB**: Lịch sử giá lưu trong bảng PostgreSQL thông thường.
- **Mobile App**: Chỉ có web app; chưa có React Native.
- **Free tier constraints**: Cold start, giới hạn kết nối đồng thời và dung lượng lưu trữ.

## 8.2 Hướng Phát Triển Tương Lai

Khi hệ thống cần scale lên production, thứ tự ưu tiên nâng cấp đề xuất:

1. **Redis** – Giảm tải database ngay lập tức (cache, session, rate limiting)
2. **Elasticsearch** – Cải thiện trải nghiệm tìm kiếm khi catalog sản phẩm lớn
3. **Kafka** – Chuyển sang event-driven để tách coupling giữa các module
4. **AI/ML Pricing** – Tăng độ chính xác định giá khi có đủ dữ liệu lịch sử
5. **Microservices** – Tách module khi cần scale riêng lẻ (Pricing, Search)
6. **TimescaleDB** – Khi bảng price_history đạt hàng triệu bản ghi
7. **React Native** – Mở rộng sang mobile để tăng tiếp cận người dùng
