# Tài Liệu Yêu Cầu

## Giới Thiệu

ShortDate là một sàn thương mại điện tử chuyên biệt dành cho thực phẩm sắp hết hạn sử dụng (HSD ngắn). Nền tảng kết nối nhà cung cấp (siêu thị, cửa hàng, nhà sản xuất) với người tiêu dùng muốn mua thực phẩm chất lượng với giá thấp hơn 30–80% so với giá gốc, đồng thời góp phần giảm lãng phí thực phẩm trong xã hội.

Hệ thống phục vụ hai nhóm sản phẩm chính:
- **Thực phẩm khô / đóng gói**: còn HSD 30–90 ngày (mì gói, đồ hộp, nước giải khát, bánh kẹo,...)
- **Đồ ăn tươi / tiêu dùng trong ngày**: HSD 0–1 ngày (cơm hộp, sandwich, sushi,...)

---

## Bảng Thuật Ngữ

- **ShortDate_Platform**: Toàn bộ hệ thống sàn thương mại điện tử ShortDate.
- **Buyer**: Người tiêu dùng đã đăng ký tài khoản và mua hàng trên sàn.
- **Supplier**: Nhà cung cấp (siêu thị, cửa hàng, nhà sản xuất) đã đăng ký bán hàng trên sàn.
- **Admin**: Quản trị viên hệ thống ShortDate.
- **Product**: Sản phẩm thực phẩm được niêm yết trên sàn, có thông tin HSD rõ ràng.
- **Dry_Product**: Thực phẩm khô/đóng gói còn HSD từ 30 đến 90 ngày.
- **Fresh_Product**: Đồ ăn tươi/tiêu dùng trong ngày với HSD từ 0 đến 1 ngày.
- **Bundle**: Gói sản phẩm được đóng gói theo mô hình "Túi giá" (Mini, Tiêu chuẩn, Gia đình, Premium).
- **Auto_Pricing_Engine**: Thuật toán tự động điều chỉnh giá sản phẩm dựa trên thời gian còn lại đến HSD và tồn kho.
- **AI_Pricing_Module**: Mô-đun AI/ML kết hợp Computer Vision và dữ liệu lịch sử để tính Product Risk Score và đề xuất giá.
- **Product_Risk_Score**: Điểm rủi ro sản phẩm (0–100) do AI_Pricing_Module tính toán, phản ánh khả năng không bán được trước HSD.
- **Flash_Sale**: Chương trình giảm giá sâu trong thời gian giới hạn (thường dưới 24 giờ).
- **Supplier_Dashboard**: Bảng điều khiển dành cho Supplier để quản lý tồn kho, theo dõi hiệu suất và cấu hình Auto_Pricing_Engine.
- **3PL**: Carrier bên thứ ba phục vụ giao hàng toàn quốc cho Dry_Product.
- **HSD**: Hạn sử dụng (ngày hết hạn) của sản phẩm.
- **Order**: Đơn hàng được tạo khi Buyer xác nhận mua một hoặc nhiều Product/Bundle.
- **Notification_Service**: Dịch vụ gửi thông báo (push, email, SMS) đến Buyer và Supplier.
- **Carrier**: Carrier (nội thành hoặc liên tỉnh) có tài khoản riêng trên hệ thống, chịu trách nhiệm nhận và giao hàng, cập nhật trạng thái đơn hàng trong quá trình vận chuyển.

---

## Yêu Cầu

### Yêu Cầu 1: Quản Lý Tài Khoản Người Dùng

**User Story:** Là một người dùng mới, tôi muốn đăng ký và quản lý tài khoản, để có thể mua hoặc bán hàng trên ShortDate.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL cho phép người dùng đăng ký tài khoản bằng email hoặc số điện thoại và mật khẩu.
2. WHEN người dùng cung cấp email hoặc số điện thoại đã tồn tại trong hệ thống, THE ShortDate_Platform SHALL trả về thông báo lỗi "Tài khoản đã tồn tại" và không tạo tài khoản mới.
3. WHEN người dùng đăng ký thành công, THE ShortDate_Platform SHALL gửi email hoặc SMS xác minh đến địa chỉ đã đăng ký trong vòng 60 giây.
4. WHEN người dùng chưa xác minh tài khoản, THE ShortDate_Platform SHALL giới hạn quyền truy cập chỉ ở chức năng xem sản phẩm.
5. THE ShortDate_Platform SHALL hỗ trợ đăng nhập bằng tài khoản Google hoặc Facebook.
6. WHEN người dùng nhập sai mật khẩu 5 lần liên tiếp, THE ShortDate_Platform SHALL khóa tài khoản tạm thời trong 15 phút và gửi thông báo đến email đã đăng ký.
7. THE ShortDate_Platform SHALL cho phép Supplier đăng ký tài khoản doanh nghiệp với thông tin: tên doanh nghiệp, mã số thuế, địa chỉ kho hàng, thông tin liên hệ.
8. WHEN Supplier nộp hồ sơ đăng ký, THE Admin SHALL xét duyệt và phê duyệt hoặc từ chối trong vòng 48 giờ làm việc.
9. THE ShortDate_Platform SHALL cho phép đăng ký tài khoản Carrier với thông tin: tên đơn vị, khu vực hoạt động, thông tin liên hệ; tài khoản Carrier phải được Admin phê duyệt trước khi sử dụng.

---

### Yêu Cầu 2: Niêm Yết và Quản Lý Sản Phẩm

**User Story:** Là một Supplier, tôi muốn đăng sản phẩm lên sàn với đầy đủ thông tin HSD và giá, để Buyer có thể tìm thấy và mua hàng của tôi.

#### Tiêu Chí Chấp Nhận

1. THE Supplier SHALL cung cấp các thông tin bắt buộc khi niêm yết Product: tên sản phẩm, hình ảnh, danh mục, HSD, số lượng tồn kho, giá gốc, giá bán.
2. WHEN Supplier niêm yết Product mà không điền đủ thông tin bắt buộc, THE ShortDate_Platform SHALL từ chối lưu và hiển thị danh sách các trường còn thiếu.
3. THE ShortDate_Platform SHALL hiển thị minh bạch HSD, giá gốc và mức chiết khấu (%) trên trang chi tiết mỗi Product.
4. WHEN HSD của một Product còn dưới 7 ngày, THE Notification_Service SHALL gửi cảnh báo đến Supplier tương ứng.
5. WHEN số lượng tồn kho của một Product giảm xuống dưới ngưỡng tối thiểu do Supplier thiết lập, THE Notification_Service SHALL gửi cảnh báo tồn kho thấp đến Supplier.
6. THE Supplier SHALL phân loại Product là Dry_Product hoặc Fresh_Product khi niêm yết.
7. WHEN Supplier niêm yết Dry_Product với HSD dưới 30 ngày hoặc trên 90 ngày, THE ShortDate_Platform SHALL hiển thị cảnh báo xác nhận trước khi lưu.
8. THE ShortDate_Platform SHALL cho phép Supplier cập nhật số lượng tồn kho và giá bán của Product đã niêm yết bất kỳ lúc nào.

---

### Yêu Cầu 3: Mô Hình Gói Giá (Bundle)

**User Story:** Là một Buyer, tôi muốn mua thực phẩm theo gói với mức giá cố định, để tiết kiệm thời gian lựa chọn và chi phí mua sắm.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL hỗ trợ bốn loại Bundle: Túi Mini (15.000–25.000đ), Túi Tiêu chuẩn (30.000–50.000đ), Túi Gia đình (99.000–149.000đ), Túi Premium (199.000–299.000đ).
2. THE ShortDate_Platform SHALL đảm bảo giá trị thực của sản phẩm trong mỗi Bundle cao hơn giá bán Bundle tối thiểu 30%.
3. WHEN Supplier tạo Bundle, THE ShortDate_Platform SHALL yêu cầu Supplier chỉ định: loại Bundle, danh sách Product trong Bundle, số lượng mỗi Product, giá bán Bundle.
4. WHEN giá bán Bundle do Supplier nhập không thấp hơn giá trị thực tối thiểu 30%, THE ShortDate_Platform SHALL từ chối lưu và hiển thị thông báo yêu cầu điều chỉnh giá.
5. THE ShortDate_Platform SHALL hiển thị tổng giá trị thực và mức tiết kiệm (số tiền và %) trên trang chi tiết mỗi Bundle.
6. WHEN một Product trong Bundle hết hàng, THE ShortDate_Platform SHALL tự động ẩn Bundle đó khỏi danh sách hiển thị và thông báo cho Supplier.

---

### Yêu Cầu 4: Auto-Pricing Engine

**User Story:** Là một Supplier, tôi muốn hệ thống tự động điều chỉnh giá sản phẩm theo thời gian còn lại đến HSD và tồn kho, để tối ưu hóa doanh thu và giảm thiểu hàng tồn.

#### Tiêu Chí Chấp Nhận

1. THE Auto_Pricing_Engine SHALL tính toán và cập nhật giá bán của Product theo chu kỳ không quá 1 giờ một lần.
2. WHEN thời gian còn lại đến HSD của một Product giảm xuống dưới 24 giờ, THE Auto_Pricing_Engine SHALL áp dụng mức giảm giá tối thiểu 50% so với giá gốc.
3. WHEN tỷ lệ tồn kho của một Product vượt quá 80% sau khi đã qua 50% thời gian kể từ ngày nhập kho đến HSD, THE Auto_Pricing_Engine SHALL tăng mức chiết khấu thêm tối thiểu 10%.
4. THE Auto_Pricing_Engine SHALL đảm bảo giá bán sau khi điều chỉnh không thấp hơn giá sàn tối thiểu do Supplier thiết lập.
5. WHEN Auto_Pricing_Engine thay đổi giá của một Product, THE ShortDate_Platform SHALL ghi lại lịch sử thay đổi giá bao gồm: thời điểm thay đổi, giá cũ, giá mới, lý do thay đổi.
6. THE Supplier SHALL có thể bật hoặc tắt Auto_Pricing_Engine cho từng Product riêng lẻ.
7. WHEN Auto_Pricing_Engine bị tắt cho một Product, THE ShortDate_Platform SHALL giữ nguyên giá bán do Supplier thiết lập thủ công.

---

### Yêu Cầu 5: AI-Powered Pricing Module

**User Story:** Là một Supplier, tôi muốn hệ thống AI phân tích hình ảnh và dữ liệu sản phẩm để đề xuất giá tối ưu, để tôi không cần định giá thủ công cho từng sản phẩm.

#### Tiêu Chí Chấp Nhận

1. WHEN Supplier tải lên hình ảnh Product, THE AI_Pricing_Module SHALL phân tích hình ảnh để nhận diện loại sản phẩm, dạng bao bì và tình trạng bên ngoài trong vòng 10 giây.
2. THE AI_Pricing_Module SHALL tính toán Product_Risk_Score (thang điểm 0–100) dựa trên: kết quả phân tích hình ảnh, thời gian còn lại đến HSD, dữ liệu lịch sử bán hàng của sản phẩm cùng loại.
3. WHEN Product_Risk_Score lớn hơn hoặc bằng 70, THE AI_Pricing_Module SHALL đề xuất mức chiết khấu tối thiểu 40% so với giá gốc.
4. WHEN Product_Risk_Score nhỏ hơn 30, THE AI_Pricing_Module SHALL đề xuất mức chiết khấu từ 10% đến 20% so với giá gốc.
5. THE AI_Pricing_Module SHALL hiển thị giá đề xuất và Product_Risk_Score cho Supplier trước khi Supplier xác nhận niêm yết.
6. THE Supplier SHALL có thể chấp nhận hoặc điều chỉnh giá đề xuất của AI_Pricing_Module trước khi niêm yết Product.
7. THE AI_Pricing_Module SHALL cập nhật mô hình dự đoán dựa trên dữ liệu giao dịch thực tế theo chu kỳ không quá 24 giờ một lần.
8. IF AI_Pricing_Module không thể phân tích hình ảnh do chất lượng ảnh thấp, THEN THE ShortDate_Platform SHALL yêu cầu Supplier tải lên hình ảnh khác và hiển thị hướng dẫn chụp ảnh đạt chuẩn.

---

### Yêu Cầu 6: Tìm Kiếm và Lọc Sản Phẩm

**User Story:** Là một Buyer, tôi muốn tìm kiếm và lọc sản phẩm theo nhiều tiêu chí, để nhanh chóng tìm được sản phẩm phù hợp với nhu cầu.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL cho phép Buyer tìm kiếm Product theo từ khóa tên sản phẩm và trả về kết quả trong vòng 2 giây.
2. THE ShortDate_Platform SHALL cung cấp bộ lọc sản phẩm theo các tiêu chí: khoảng HSD còn lại (ngày), danh mục ngành hàng, khu vực giao hàng, mức giảm giá (%), khoảng giá bán, loại sản phẩm (Dry_Product / Fresh_Product).
3. THE ShortDate_Platform SHALL cho phép Buyer kết hợp nhiều bộ lọc cùng lúc và cập nhật kết quả ngay lập tức mà không cần tải lại trang.
4. THE ShortDate_Platform SHALL sắp xếp kết quả tìm kiếm theo các tùy chọn: HSD gần nhất, mức giảm giá cao nhất, giá thấp nhất, mới nhất.
5. WHEN không có Product nào khớp với tiêu chí tìm kiếm, THE ShortDate_Platform SHALL hiển thị thông báo "Không tìm thấy sản phẩm phù hợp" và gợi ý các danh mục liên quan.
6. THE ShortDate_Platform SHALL gợi ý Product cho Buyer dựa trên lịch sử xem và mua hàng của Buyer đó.

---

### Yêu Cầu 7: Flash Sale và Deal Theo Ngày

**User Story:** Là một Buyer, tôi muốn tham gia các chương trình Flash Sale và Deal theo ngày, để mua được sản phẩm với giá ưu đãi nhất.

#### Tiêu Chí Chấp Nhận

1. THE Admin SHALL có thể tạo chương trình Flash_Sale với thông tin: tên chương trình, thời gian bắt đầu, thời gian kết thúc (tối đa 24 giờ), danh sách Product tham gia, mức giảm giá.
2. WHEN thời gian bắt đầu Flash_Sale đến, THE ShortDate_Platform SHALL tự động áp dụng giá Flash_Sale cho các Product tham gia và hiển thị đồng hồ đếm ngược thời gian còn lại.
3. WHEN thời gian kết thúc Flash_Sale đến, THE ShortDate_Platform SHALL tự động khôi phục giá gốc (hoặc giá Auto_Pricing_Engine) cho các Product tham gia.
4. WHEN số lượng Product trong Flash_Sale hết hàng trước khi Flash_Sale kết thúc, THE ShortDate_Platform SHALL hiển thị trạng thái "Hết hàng" và không cho phép thêm vào giỏ hàng.
5. THE ShortDate_Platform SHALL hiển thị trang "Deal Hôm Nay" tổng hợp tất cả Product có mức giảm giá từ 30% trở lên trong ngày hiện tại.
6. WHEN Buyer đăng ký nhận thông báo Flash_Sale, THE Notification_Service SHALL gửi thông báo push đến Buyer trước 30 phút khi Flash_Sale bắt đầu.

---

### Yêu Cầu 8: Giỏ Hàng và Đặt Hàng

**User Story:** Là một Buyer, tôi muốn thêm sản phẩm vào giỏ hàng và đặt hàng dễ dàng, để hoàn tất giao dịch mua sắm nhanh chóng.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL cho phép Buyer thêm Product hoặc Bundle vào giỏ hàng mà không cần đăng nhập, nhưng yêu cầu đăng nhập khi tiến hành thanh toán.
2. WHEN Buyer thêm Product vào giỏ hàng với số lượng vượt quá tồn kho hiện có, THE ShortDate_Platform SHALL giới hạn số lượng tối đa bằng tồn kho và hiển thị thông báo cho Buyer.
3. WHEN giá của Product trong giỏ hàng thay đổi do Auto_Pricing_Engine, THE ShortDate_Platform SHALL cập nhật giá trong giỏ hàng và hiển thị thông báo thay đổi giá cho Buyer.
4. THE ShortDate_Platform SHALL hiển thị tổng giá trị đơn hàng, phí vận chuyển và tổng thanh toán trước khi Buyer xác nhận đặt hàng.
5. WHEN Buyer xác nhận đặt hàng thành công, THE ShortDate_Platform SHALL tạo Order với mã đơn hàng duy nhất và gửi xác nhận đến email/số điện thoại của Buyer trong vòng 60 giây.
6. WHEN Buyer xác nhận đặt hàng, THE ShortDate_Platform SHALL trừ số lượng tương ứng khỏi tồn kho của Supplier ngay lập tức.
7. THE ShortDate_Platform SHALL hỗ trợ các phương thức thanh toán: ví điện tử (MoMo, ZaloPay, VNPay), thẻ ngân hàng nội địa (ATM), thẻ quốc tế (Visa/Mastercard), thanh toán khi nhận hàng (COD).

---

### Yêu Cầu 9: Giao Hàng

**User Story:** Là một Buyer, tôi muốn nhận hàng đúng hạn và phù hợp với loại sản phẩm, để đảm bảo chất lượng thực phẩm khi nhận.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL hỗ trợ giao hàng nhanh nội thành trong vòng 4 giờ cho Fresh_Product.
2. THE ShortDate_Platform SHALL hỗ trợ giao hàng toàn quốc qua 3PL cho Dry_Product với thời gian giao hàng từ 1 đến 5 ngày làm việc.
3. WHEN Buyer đặt Order chứa Fresh_Product, THE ShortDate_Platform SHALL chỉ hiển thị tùy chọn giao hàng nhanh nội thành và yêu cầu Buyer xác nhận địa chỉ giao hàng nằm trong vùng phục vụ.
4. WHEN địa chỉ giao hàng của Buyer nằm ngoài vùng phục vụ giao hàng nhanh, THE ShortDate_Platform SHALL thông báo cho Buyer và không cho phép đặt Order chứa Fresh_Product.
5. THE ShortDate_Platform SHALL cung cấp tính năng theo dõi trạng thái giao hàng theo thời gian thực cho mỗi Order.
6. WHEN trạng thái giao hàng của Order thay đổi, THE Notification_Service SHALL gửi thông báo cập nhật đến Buyer.
7. WHEN Buyer xác nhận đặt hàng thành công, THE Supplier SHALL có thể xác nhận đơn hàng và cập nhật trạng thái lần lượt: "đang chuẩn bị hàng" → "đã bàn giao Carrier".
8. WHEN Supplier cập nhật trạng thái "đã bàn giao Carrier" cho đơn hàng chứa Fresh_Product, THE ShortDate_Platform SHALL thông báo đến Carrier được phân công để tiếp nhận và giao hàng.
9. THE Carrier SHALL có thể cập nhật trạng thái giao hàng cho đơn được phân công: "đang lấy hàng" → "đang giao" → "đã giao" hoặc "giao thất bại" kèm lý do.
10. WHEN Carrier cập nhật trạng thái "giao thất bại", THE Notification_Service SHALL gửi thông báo đến Buyer và Supplier kèm lý do, và THE ShortDate_Platform SHALL cho phép Carrier lên lịch giao lại hoặc Supplier xử lý hoàn hàng.
11. WHEN đơn hàng chứa Dry_Product được bàn giao cho 3PL, THE ShortDate_Platform SHALL nhận cập nhật trạng thái tự động qua webhook từ 3PL và đồng bộ vào hệ thống theo dõi đơn hàng.

---

### Yêu Cầu 10: Quản Lý Vận Chuyển (Carrier)

**User Story:** Là một Carrier, tôi muốn có công cụ để nhận đơn hàng, cập nhật trạng thái giao hàng và quản lý lịch giao, để vận hành hiệu quả và minh bạch với Buyer và Supplier.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL cho phép Carrier đăng ký tài khoản với thông tin: tên đơn vị, khu vực hoạt động, thông tin liên hệ; tài khoản phải được Admin phê duyệt trước khi sử dụng.
2. WHEN Supplier cập nhật trạng thái đơn hàng là "đã bàn giao cho đơn vị vận chuyển", THE ShortDate_Platform SHALL hiển thị đơn hàng đó trong danh sách chờ tiếp nhận của Carrier được phân công.
3. THE Carrier SHALL có thể xem danh sách đơn hàng được phân công kèm thông tin: địa chỉ lấy hàng, địa chỉ giao hàng, loại sản phẩm, thời hạn giao.
4. THE Carrier SHALL có thể cập nhật trạng thái giao hàng theo luồng: "đang lấy hàng" → "đang giao" → "đã giao" hoặc "giao thất bại" kèm lý do và hình ảnh xác nhận.
5. WHEN Carrier cập nhật trạng thái "đã giao", THE ShortDate_Platform SHALL yêu cầu Carrier tải lên hình ảnh xác nhận giao hàng thành công.
6. WHEN Carrier cập nhật trạng thái "giao thất bại", THE Carrier SHALL chỉ định lý do (không có người nhận, địa chỉ sai, Buyer từ chối nhận) và THE ShortDate_Platform SHALL thông báo đến Buyer và Supplier để phối hợp xử lý.
7. THE Carrier SHALL có thể lên lịch giao lại cho đơn hàng giao thất bại trong vòng 24 giờ kể từ lần giao thất bại đầu tiên.
8. THE ShortDate_Platform SHALL cung cấp cho Carrier trang tổng quan hiển thị: số đơn đang xử lý, số đơn đã giao thành công trong ngày, tỷ lệ giao thành công.

---

### Yêu Cầu 11: Supplier Dashboard

**User Story:** Là một Supplier, tôi muốn có bảng điều khiển thông minh để quản lý tồn kho và theo dõi hiệu suất kinh doanh, để đưa ra quyết định kinh doanh kịp thời.

#### Tiêu Chí Chấp Nhận

1. THE Supplier_Dashboard SHALL hiển thị tổng quan hiệu suất kinh doanh theo ngày, tuần và tháng: doanh thu, số đơn hàng, số sản phẩm đã bán, tỷ lệ bán hết trước HSD.
2. THE Supplier_Dashboard SHALL hiển thị danh sách Product sắp hết HSD (còn dưới 7 ngày) kèm số lượng tồn kho hiện tại.
3. THE Supplier_Dashboard SHALL cho phép Supplier cấu hình quy tắc Auto_Pricing_Engine cho từng Product: giá sàn tối thiểu, mức giảm giá tối đa, ngưỡng kích hoạt giảm giá theo thời gian.
4. THE Supplier_Dashboard SHALL hiển thị biểu đồ lịch sử thay đổi giá và tương quan với lượng bán cho từng Product.
5. THE Supplier_Dashboard SHALL cung cấp báo cáo phân tích hành vi tiêu dùng: sản phẩm được xem nhiều nhất, tỷ lệ chuyển đổi từ xem sang mua, thời điểm mua hàng cao điểm trong ngày.
6. WHEN tỷ lệ bán hết trước HSD của Supplier trong tháng đạt trên 90%, THE Supplier_Dashboard SHALL hiển thị huy hiệu "Nhà cung cấp xuất sắc" trên trang hồ sơ Supplier.

---

### Yêu Cầu 12: Quảng Cáo Nội Sàn

**User Story:** Là một Supplier, tôi muốn quảng bá sản phẩm của mình trên sàn, để tăng khả năng hiển thị và doanh số bán hàng.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL cung cấp các vị trí quảng cáo nội sàn: banner trang chủ, vị trí nổi bật trong kết quả tìm kiếm, gợi ý sản phẩm được tài trợ.
2. THE Supplier SHALL có thể tạo chiến dịch quảng cáo với ngân sách, thời gian chạy và Product mục tiêu.
3. WHEN ngân sách quảng cáo của Supplier cạn kiệt, THE ShortDate_Platform SHALL tự động dừng chiến dịch quảng cáo và gửi thông báo đến Supplier.
4. THE Supplier_Dashboard SHALL hiển thị báo cáo hiệu suất quảng cáo: số lần hiển thị, số lần nhấp, tỷ lệ chuyển đổi, chi phí mỗi lần nhấp (CPC).
5. THE ShortDate_Platform SHALL phân biệt rõ ràng Product được tài trợ (quảng cáo) với Product thông thường bằng nhãn "Tài trợ" hiển thị trên giao diện Buyer.

---

### Yêu Cầu 13: Đánh Giá và Phản Hồi

**User Story:** Là một Buyer, tôi muốn đánh giá sản phẩm và Supplier sau khi nhận hàng, để giúp cộng đồng có thêm thông tin tin cậy khi mua sắm.

#### Tiêu Chí Chấp Nhận

1. WHEN Order của Buyer được xác nhận giao hàng thành công, THE ShortDate_Platform SHALL cho phép Buyer đánh giá Product và Supplier trong vòng 7 ngày.
2. THE ShortDate_Platform SHALL yêu cầu Buyer cung cấp: điểm đánh giá (1–5 sao), nhận xét văn bản (tối thiểu 10 ký tự), và tùy chọn tải lên hình ảnh thực tế.
3. THE ShortDate_Platform SHALL hiển thị điểm đánh giá trung bình và tổng số lượt đánh giá trên trang chi tiết Product và trang hồ sơ Supplier.
4. WHEN Supplier nhận đánh giá dưới 3 sao, THE Notification_Service SHALL gửi thông báo đến Supplier kèm nội dung đánh giá.
5. WHEN điểm đánh giá trung bình của Supplier giảm xuống dưới 3.0 trong 30 ngày liên tiếp, THE Admin SHALL nhận cảnh báo để xem xét và có biện pháp xử lý phù hợp.

---

### Yêu Cầu 14: Quản Lý Admin

**User Story:** Là một Admin, tôi muốn có đầy đủ công cụ để quản lý người dùng, vận hành sàn và giám sát hệ thống, để đảm bảo sàn hoạt động an toàn và hiệu quả.

#### Tiêu Chí Chấp Nhận

1. WHEN Supplier nộp hồ sơ đăng ký tài khoản doanh nghiệp, THE Admin SHALL xét duyệt và phê duyệt hoặc từ chối hồ sơ làm việc kèm lý do từ chối nếu có.
2. WHEN Admin phê duyệt hoặc từ chối hồ sơ Supplier, THE ShortDate_Platform SHALL gửi thông báo kết quả đến email của Supplier trong vòng 60 giây.
3. THE Admin SHALL có thể tạo chương trình Flash_Sale với thông tin: tên chương trình, thời gian bắt đầu, thời gian kết thúc (tối đa 24 giờ), danh sách Product tham gia và mức giảm giá.
4. THE Admin SHALL có thể chỉnh sửa hoặc hủy Flash_Sale đang chờ kích hoạt; WHEN Flash_Sale đã bắt đầu, THE Admin SHALL chỉ được phép kết thúc sớm chứ không được chỉnh sửa thông tin.
5. WHEN điểm đánh giá trung bình của Supplier giảm xuống dưới 3.0 trong 30 ngày liên tiếp, THE ShortDate_Platform SHALL gửi cảnh báo đến Admin kèm thông tin chi tiết về Supplier và lịch sử đánh giá.
6. WHEN Admin nhận cảnh báo Supplier có rating thấp, THE Admin SHALL có thể thực hiện một trong các hành động: gửi cảnh báo chính thức đến Supplier, tạm khóa tài khoản Supplier hoặc đánh dấu để theo dõi thêm.
7. THE Admin SHALL có thể xem danh sách toàn bộ tài khoản Buyer và Supplier với các bộ lọc theo: trạng thái tài khoản, ngày đăng ký, loại tài khoản.
8. THE Admin SHALL có thể khóa hoặc mở khóa tài khoản Buyer hoặc Supplier thủ công kèm lý do; WHEN tài khoản bị khóa, THE ShortDate_Platform SHALL gửi thông báo đến email của người dùng đó trong vòng 60 giây.
9. THE Admin SHALL có thể truy cập và tìm kiếm audit log hệ thống theo khoảng thời gian, loại thao tác và tài khoản thực hiện.
10. THE ShortDate_Platform SHALL cung cấp cho Admin trang tổng quan hệ thống hiển thị: tổng doanh thu toàn sàn theo ngày/tuần/tháng, số lượng Supplier và Buyer đang hoạt động, tổng số đơn hàng theo trạng thái.
11. THE Admin SHALL có thể xem danh sách toàn bộ Product đang niêm yết trên sàn và kiểm tra nội dung từng sản phẩm (tên, hình ảnh, mô tả, HSD, danh mục).
12. WHEN Admin xác định một Product vi phạm chính sách (hàng giả, hàng cấm, thông tin sai lệch), THE Admin SHALL có thể khóa Product đó ngay lập tức; WHEN Product bị khóa, THE ShortDate_Platform SHALL ẩn Product khỏi sàn, gửi thông báo đến Supplier kèm lý do vi phạm, và ghi lại hành động vào audit log.

---

### Yêu Cầu 15: Bảo Mật và Tuân Thủ

**User Story:** Là một người dùng, tôi muốn thông tin cá nhân và giao dịch của mình được bảo vệ an toàn, để yên tâm sử dụng nền tảng.

#### Tiêu Chí Chấp Nhận

1. THE ShortDate_Platform SHALL mã hóa toàn bộ dữ liệu truyền tải giữa client và server bằng giao thức TLS 1.2 trở lên.
2. THE ShortDate_Platform SHALL mã hóa thông tin thanh toán và thông tin cá nhân nhạy cảm khi lưu trữ trong cơ sở dữ liệu.
3. THE ShortDate_Platform SHALL tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo pháp luật Việt Nam hiện hành.
4. WHEN phát hiện hoạt động đăng nhập bất thường (đăng nhập từ thiết bị mới hoặc địa điểm khác thường), THE ShortDate_Platform SHALL yêu cầu xác minh danh tính bổ sung qua OTP.
5. THE ShortDate_Platform SHALL lưu trữ nhật ký (audit log) cho tất cả các thao tác quan trọng: đăng nhập, thay đổi giá, tạo/hủy đơn hàng, thay đổi thông tin tài khoản.
