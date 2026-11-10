# TEACHER DONG ACADEMY

## Đặc tả chi tiết màn hình, trường dữ liệu, nút chức năng, quy tắc kiểm tra và thông báo

**Phiên bản:** 1.0\
**Cơ sở xây dựng:** Tài liệu "Teacher Dong Academy -- Đặc tả Phạm vi
Chức năng & Hệ thống" (SRS) do người dùng cung cấp.\
**Mục đích:** Làm rõ yêu cầu ở mức màn hình để phục vụ UI/UX, Frontend,
Backend, kiểm thử và nghiệm thu.

------------------------------------------------------------------------

## 1. Quy ước và phạm vi tài liệu

### 1.1. Phân biệt mức độ xác nhận

Tài liệu nguồn mô tả phạm vi chức năng, vai trò, một số quy tắc nghiệp
vụ, công nghệ và mô hình dữ liệu chính. Tài liệu nguồn **chưa mô tả đầy
đủ** tất cả trường giao diện, giới hạn dữ liệu, trạng thái, thông báo và
luồng ngoại lệ.

Để tránh biến giả định thành yêu cầu chính thức, nội dung được đánh dấu
như sau:

-   **\[ĐÃ NÊU TRONG SRS\]**: Có căn cứ trực tiếp trong tài liệu nguồn.
-   **\[ĐỀ XUẤT -- CẦN BA XÁC NHẬN\]**: Chi tiết hóa cần thiết để triển
    khai nhưng tài liệu nguồn chưa quy định.
-   **\[CHƯA QUY ĐỊNH\]**: Tài liệu nguồn không cung cấp thông tin;
    không tự đặt giá trị.

Các trường/nút được đề xuất không mặc nhiên là yêu cầu đã được khách
hàng phê duyệt.

### 1.2. Vai trò

  -----------------------------------------------------------------------
  Mã vai trò              Tên                     Mô tả
  ----------------------- ----------------------- -----------------------
  STUDENT                 Học viên                Đăng ký, đăng nhập,
                                                  tham gia khóa học, xem
                                                  học liệu, học trực
                                                  tuyến, làm bài tập và
                                                  theo dõi kết quả

  ADMIN                   Quản trị viên           Quản lý tài khoản, khóa
                                                  học, nội dung, học
                                                  liệu, lớp học, bài tập,
                                                  điểm số, điểm danh và
                                                  hỗ trợ học viên
  -----------------------------------------------------------------------

**\[ĐÃ NÊU TRONG SRS\]** Hệ thống phân quyền theo hai vai trò STUDENT và
ADMIN.

### 1.3. Quy ước mã

  Loại mã             Quy ước                Ví dụ
  ------------------- ---------------------- --------------
  Màn hình            `<MODULE>-SCR-<NNN>`   AUTH-SCR-001
  Trường dữ liệu      `<MODULE>-FLD-<NNN>`   AUTH-FLD-001
  Nút/hành động       `<MODULE>-ACT-<NNN>`   AUTH-ACT-001
  Validation          `VAL-<MODULE>-<NNN>`   VAL-AUTH-001
  Thông báo           `MSG-<MODULE>-<NNN>`   MSG-AUTH-001
  Quy tắc nghiệp vụ   `BIZ-<MODULE>-<NNN>`   BIZ-AUTH-001

### 1.4. Cấu trúc mô tả một trường

Mỗi trường nên có các thuộc tính: Mã trường, tên hiển thị, tên kỹ thuật
dự kiến, kiểu dữ liệu, bắt buộc, nguồn dữ liệu, quyền chỉnh sửa, quy tắc
kiểm tra và ghi chú.

Tên kỹ thuật trong tài liệu này chỉ là tên gợi ý để trao đổi; cần thống
nhất với thiết kế API và database trước khi phát triển.

### 1.5. Cấu trúc mô tả một hành động

Mỗi hành động cần xác định: mã hành động, tên nút, vai trò được phép,
điều kiện trước khi thực hiện, xử lý, kết quả sau xử lý, xác nhận trước
thao tác, thông báo thành công và thông báo lỗi.

------------------------------------------------------------------------

## 2. Tổng quan phân hệ và màn hình

  -----------------------------------------------------------------------
  Phân hệ           Mã màn hình       Màn hình          Vai trò
  ----------------- ----------------- ----------------- -----------------
  Xác thực & tài    AUTH-SCR-001      Đăng ký           STUDENT
  khoản                                                 

  Xác thực & tài    AUTH-SCR-002      Đăng nhập         STUDENT, ADMIN
  khoản                                                 

  Xác thực & tài    AUTH-SCR-003      Quản lý tài khoản ADMIN
  khoản                               học viên          

  Xác thực & tài    AUTH-SCR-004      Thay đổi mật khẩu STUDENT
  khoản                                                 

  Xác thực & tài    AUTH-SCR-005      Quản lý phiên     STUDENT
  khoản                               đăng nhập         

  Đa ngôn ngữ       I18N-SCR-001      Chọn ngôn ngữ     Khách, STUDENT,
                                                        ADMIN

  LMS               LMS-SCR-001       Danh sách khóa    STUDENT, ADMIN
                                      học               

  LMS               LMS-SCR-002       Chi tiết khóa học STUDENT, ADMIN

  LMS               LMS-SCR-003       Tạo/cập nhật khóa ADMIN
                                      học               

  LMS               LMS-SCR-004       Quản lý chương    ADMIN
                                      học               

  LMS               LMS-SCR-005       Quản lý bài học   ADMIN

  LMS               LMS-SCR-006       Học nội dung bài  STUDENT
                                      học               

  LMS               LMS-SCR-007       Theo dõi tiến độ  STUDENT, ADMIN
                                      học tập           

  Kho học liệu      LIB-SCR-001       Danh sách học     ADMIN
                                      liệu              

  Kho học liệu      LIB-SCR-002       Tải lên/chỉnh sửa ADMIN
                                      học liệu          

  Kho học liệu      LIB-SCR-003       Trình xem         STUDENT
                                      PDF/Audio         

  Lớp học trực      CLASS-SCR-001     Lịch và danh sách STUDENT, ADMIN
  tuyến                               phòng học         

  Lớp học trực      CLASS-SCR-002     Phòng học trực    STUDENT, ADMIN
  tuyến                               tuyến             

  Lớp học trực      CLASS-SCR-003     Bảng trắng tương  STUDENT, ADMIN
  tuyến                               tác               

  Writing           WR-SCR-001        Danh sách đề      STUDENT
                                      Writing           

  Writing           WR-SCR-002        Làm bài Writing   STUDENT

  Writing           WR-SCR-003        Danh sách bài     ADMIN
                                      nộp/chờ duyệt     

  Writing           WR-SCR-004        Chi tiết và duyệt ADMIN
                                      kết quả Writing   

  Writing           WR-SCR-005        Kết quả Writing   STUDENT

  Speaking          SP-SCR-001        Danh sách đề      STUDENT
                                      Speaking          

  Speaking          SP-SCR-002        Ghi âm và nộp     STUDENT
                                      Speaking          

  Speaking          SP-SCR-003        Danh sách bài     ADMIN
                                      Speaking chờ chấm 

  Speaking          SP-SCR-004        Nghe và chấm      ADMIN
                                      Speaking          

  Speaking          SP-SCR-005        Kết quả Speaking  STUDENT

  Quiz              QZ-SCR-001        Danh sách bài     STUDENT, ADMIN
                                      kiểm tra          

  Quiz              QZ-SCR-002        Làm bài kiểm tra  STUDENT

  Quiz              QZ-SCR-003        Kết quả Quiz      STUDENT

  Quiz              QZ-SCR-004        Quản lý Quiz      ADMIN

  Quiz              QZ-SCR-005        Quản lý ngân hàng ADMIN
                                      câu hỏi           

  Điểm danh         ATT-SCR-001       Danh sách/báo cáo ADMIN
                                      điểm danh         

  Điểm danh         ATT-SCR-002       Chi tiết và điều  ADMIN
                                      chỉnh điểm danh   

  Dashboard         DASH-SCR-001      Dashboard học     STUDENT
                                      viên              

  Dashboard         DASH-SCR-002      Dashboard Admin   ADMIN

  Nhắn tin          CHAT-SCR-001      Danh sách hội     STUDENT, ADMIN
                                      thoại             

  Nhắn tin          CHAT-SCR-002      Chi tiết hội      STUDENT, ADMIN
                                      thoại             
  -----------------------------------------------------------------------

Danh sách màn hình là cấu trúc phân rã đề xuất từ các chức năng trong
SRS. Cần đối chiếu wireframe/mockup để chốt số lượng màn hình thực tế.

------------------------------------------------------------------------

# 3. Đặc tả chi tiết màn hình

## 3.1. Phân hệ xác thực và quản lý tài khoản (AUTH)

### AUTH-SCR-001 -- Đăng ký tài khoản

**Mục đích:** Cho phép học viên tạo tài khoản bằng email và mật khẩu;
SRS cũng nêu đăng ký bằng Google.

**Vai trò:** STUDENT.

#### Trường dữ liệu

  -----------------------------------------------------------------------------------
  Mã trường      Tên hiển    Tên kỹ thuật gợi  Kiểu           Bắt buộc    Nguồn/Ghi
                 thị         ý                                            chú
  -------------- ----------- ----------------- -------------- ----------- -----------
  AUTH-FLD-001   Email       email             Email/String   Có          Người dùng
                                                                          nhập; đăng
                                                                          ký bằng
                                                                          email và
                                                                          mật khẩu
                                                                          \[ĐÃ NÊU\]

  AUTH-FLD-002   Mật khẩu    password          Password       Có          Người dùng
                                                                          nhập \[ĐÃ
                                                                          NÊU\]

  AUTH-FLD-003   Xác nhận    confirmPassword   Password       Đề xuất     \[ĐỀ XUẤT\]
                 mật khẩu                                                 SRS chưa
                                                                          nêu trường
                                                                          này

  AUTH-FLD-004   Họ và tên   fullName          String         Chưa xác    \[CHƯA QUY
                                                              định        ĐỊNH\] Cần
                                                                          xác nhận dữ
                                                                          liệu hồ sơ
                                                                          bắt buộc

  AUTH-FLD-005   Ngôn ngữ    language          Enum           Không       VI, EN, JA,
                                                                          ZH; đồng bộ
                                                                          theo lựa
                                                                          chọn ngôn
                                                                          ngữ

  AUTH-FLD-006   Đồng ý điều acceptedTerms     Boolean        Chưa xác    \[CHƯA QUY
                 khoản                                        định        ĐỊNH\]
  -----------------------------------------------------------------------------------

#### Nút/hành động

  --------------------------------------------------------------------------
  Mã             Nút            Vai trò        Điều kiện và   Kết quả
                                               xử lý          
  -------------- -------------- -------------- -------------- --------------
  AUTH-ACT-001   Đăng ký        STUDENT        Kiểm tra dữ    Tài khoản được
                                               liệu; tạo tài  tạo
                                               khoản nếu hợp  
                                               lệ             

  AUTH-ACT-002   Đăng ký bằng   STUDENT        Khởi chạy      Tạo tài khoản
                 Google                        Google OAuth   theo kết quả
                                               2.0            OAuth

  AUTH-ACT-003   Đăng nhập      STUDENT        Điều hướng đến Mở
                                               màn hình đăng  AUTH-SCR-002
                                               nhập           

  AUTH-ACT-004   Hiện/ẩn mật    STUDENT        Đổi chế độ     Không thay đổi
                 khẩu                          hiển thị       dữ liệu
                                               trường mật     
                                               khẩu           
  --------------------------------------------------------------------------

#### Validation

  -----------------------------------------------------------------------
  Mã                Trường            Điều kiện         Thông báo
  ----------------- ----------------- ----------------- -----------------
  VAL-AUTH-001      Email             Không được bỏ     MSG-AUTH-001
                                      trống             

  VAL-AUTH-002      Email             Phải đúng định    MSG-AUTH-002
                                      dạng email        

  VAL-AUTH-003      Email             Email chưa được   MSG-AUTH-003
                                      sử dụng           

  VAL-AUTH-004      Mật khẩu          Không được bỏ     MSG-AUTH-004
                                      trống             

  VAL-AUTH-005      Xác nhận mật khẩu Nếu có trường     MSG-AUTH-005
                                      này, phải trùng   
                                      mật khẩu          
  -----------------------------------------------------------------------

**Chưa quy định:** Độ dài mật khẩu, nhóm ký tự bắt buộc, xác minh
email/OTP, giới hạn số lần đăng ký và chính sách khóa tài khoản.

#### Thông báo

  -----------------------------------------------------------------------
  Mã                Nội dung          Loại              Thời điểm
  ----------------- ----------------- ----------------- -----------------
  MSG-AUTH-001      Vui lòng nhập     VALIDATION        Email trống
                    email                               

  MSG-AUTH-002      Email không đúng  VALIDATION        Email sai định
                    định dạng                           dạng

  MSG-AUTH-003      Email đã được sử  ERROR             Email đã tồn tại
                    dụng                                

  MSG-AUTH-004      Vui lòng nhập mật VALIDATION        Mật khẩu trống
                    khẩu                                

  MSG-AUTH-005      Mật khẩu xác nhận VALIDATION        Hai mật khẩu khác
                    không khớp                          nhau

  MSG-AUTH-006      Đăng ký tài khoản SUCCESS           Tạo tài khoản
                    thành công                          thành công

  MSG-AUTH-007      Không thể đăng ký ERROR             Lỗi xử lý
                    tài khoản. Vui                      
                    lòng thử lại                        
  -----------------------------------------------------------------------

------------------------------------------------------------------------

### AUTH-SCR-002 -- Đăng nhập

**Mục đích:** Xác thực người dùng bằng email/mật khẩu hoặc Google OAuth
2.0.

**Vai trò:** STUDENT, ADMIN.

#### Trường dữ liệu

  -----------------------------------------------------------------------------
  Mã trường      Tên hiển    Tên kỹ      Kiểu           Bắt buộc    Ghi chú
                 thị         thuật gợi ý                            
  -------------- ----------- ----------- -------------- ----------- -----------
  AUTH-FLD-007   Email       email       Email/String   Có          \[ĐÃ NÊU\]

  AUTH-FLD-008   Mật khẩu    password    Password       Có          \[ĐÃ NÊU\]

  AUTH-FLD-009   Ngôn ngữ    language    Enum           Không       Theo lựa
                 giao diện                                          chọn ngôn
                                                                    ngữ
  -----------------------------------------------------------------------------

#### Nút/hành động

  -----------------------------------------------------------------------
  Mã                      Nút                     Xử lý
  ----------------------- ----------------------- -----------------------
  AUTH-ACT-005            Đăng nhập               Gửi thông tin xác thực;
                                                  kiểm tra tài khoản và
                                                  phiên

  AUTH-ACT-006            Đăng nhập Google        Thực hiện OAuth 2.0

  AUTH-ACT-007            Hiện/ẩn mật khẩu        Đổi kiểu hiển thị mật
                                                  khẩu

  AUTH-ACT-008            Quên mật khẩu           Chuyển đến chức năng
                                                  khôi phục nếu được
                                                  triển khai

  AUTH-ACT-009            Đăng ký                 Mở AUTH-SCR-001
  -----------------------------------------------------------------------

#### Quy tắc và Validation

-   Email và mật khẩu không được bỏ trống.
-   SRS quy định giới hạn số lần đăng nhập sai để hạn chế Brute-force.
-   SRS quy định JWT Access Token và Refresh Token; Refresh Token lưu
    bằng HTTP-Only Cookie.
-   SRS quy định Single Concurrent Session đối với STUDENT: đăng nhập
    thiết bị mới làm vô hiệu hóa phiên cũ.
-   Phân quyền theo STUDENT và ADMIN.
-   **Chưa quy định:** Số lần đăng nhập sai, thời gian khóa, thời hạn
    Access Token/Refresh Token và hành vi cụ thể sau khi phiên cũ bị vô
    hiệu hóa.

#### Thông báo

  -----------------------------------------------------------------------
  Mã                      Nội dung                Loại
  ----------------------- ----------------------- -----------------------
  MSG-AUTH-008            Vui lòng nhập email     VALIDATION

  MSG-AUTH-009            Vui lòng nhập mật khẩu  VALIDATION

  MSG-AUTH-010            Email hoặc mật khẩu     ERROR
                          không chính xác         

  MSG-AUTH-011            Tài khoản không hoạt    ERROR
                          động hoặc không được    
                          phép truy cập           

  MSG-AUTH-012            Tài khoản đã đăng nhập  WARNING
                          trên thiết bị khác;     
                          phiên trước đã bị vô    
                          hiệu hóa                

  MSG-AUTH-013            Đăng nhập thành công    SUCCESS

  MSG-AUTH-014            Bạn đã vượt quá số lần  WARNING
                          đăng nhập sai cho phép  

  MSG-AUTH-015            Phiên đăng nhập đã hết  WARNING
                          hạn. Vui lòng đăng nhập 
                          lại                     
  -----------------------------------------------------------------------

------------------------------------------------------------------------

### AUTH-SCR-003 -- Quản lý tài khoản học viên

**Mục đích:** Admin xem danh sách người dùng, trạng thái hoạt động và
quyền truy cập.

**Vai trò:** ADMIN.

#### Trường dữ liệu danh sách

  ----------------------------------------------------------------------------------
  Mã trường      Tên hiển thị   Tên kỹ thuật    Kiểu           Ghi chú
                                gợi ý                          
  -------------- -------------- --------------- -------------- ---------------------
  AUTH-FLD-010   Mã người dùng  userId          String/ID      Model User

  AUTH-FLD-011   Họ tên         fullName        String         Chi tiết hồ sơ cần
                                                               xác nhận

  AUTH-FLD-012   Email          email           String         Model User

  AUTH-FLD-013   Vai trò        role            Enum           STUDENT/ADMIN

  AUTH-FLD-014   Trạng thái tài status          Enum           Tập giá trị chưa được
                 khoản                                         SRS quy định

  AUTH-FLD-015   Ngày tạo       createdAt       DateTime       Đề xuất hiển thị

  AUTH-FLD-016   Trạng thái     sessionStatus   Enum           Liên quan
                 phiên                                         RefreshToken/Single
                                                               Session
  ----------------------------------------------------------------------------------

#### Nút/hành động

-   Tìm kiếm tài khoản.
-   Lọc theo vai trò/trạng thái.
-   Xem chi tiết tài khoản.
-   Cập nhật trạng thái tài khoản.
-   Xem phiên đăng nhập.

**Lưu ý:** Các hành động khóa/mở khóa, đặt lại mật khẩu hoặc thu hồi
phiên cần được xác nhận vì SRS chỉ nêu quản lý tài khoản, theo dõi trạng
thái và kiểm soát quyền truy cập, chưa mô tả đầy đủ thao tác cụ thể.

------------------------------------------------------------------------

### AUTH-SCR-004 -- Thay đổi mật khẩu

**Mục đích:** Học viên thay đổi mật khẩu tài khoản.

**Vai trò:** STUDENT.

  -----------------------------------------------------------------------------------
  Mã trường      Tên         Tên kỹ thuật         Kiểu        Bắt buộc    Ghi chú
  -------------- ----------- -------------------- ----------- ----------- -----------
  AUTH-FLD-017   Mật khẩu    currentPassword      Password    Có          Đề xuất để
                 hiện tại                                                 xác minh

  AUTH-FLD-018   Mật khẩu    newPassword          Password    Có          \[ĐÃ NÊU\]
                 mới                                                      Có chức
                                                                          năng thay
                                                                          đổi mật
                                                                          khẩu

  AUTH-FLD-019   Xác nhận    confirmNewPassword   Password    Đề xuất     Cần xác
                 mật khẩu                                                 nhận
                 mới                                                      
  -----------------------------------------------------------------------------------

**Nút:** Lưu thay đổi, Hủy, Hiện/ẩn mật khẩu.

**Validation:** Mật khẩu hiện tại phải hợp lệ; mật khẩu mới tuân thủ
chính sách mật khẩu; xác nhận phải trùng nếu trường này được sử dụng.

**Chưa quy định:** Sau khi đổi mật khẩu có thu hồi các phiên khác hay
không.

------------------------------------------------------------------------

### AUTH-SCR-005 -- Quản lý phiên đăng nhập cá nhân

**Mục đích:** Hỗ trợ cơ chế kiểm soát phiên đăng nhập.

**Vai trò:** STUDENT.

**Thông tin có thể hiển thị:** Trạng thái phiên hiện tại, thời điểm đăng
nhập, trạng thái phiên. SRS chỉ nêu quản lý phiên cá nhân và Single
Concurrent Session; chưa quy định chi tiết danh sách thiết bị, địa chỉ
IP hoặc lịch sử đăng nhập.

**Hành động:** Đăng xuất; thao tác quản lý/thu hồi phiên khác chỉ triển
khai nếu BA xác nhận.

------------------------------------------------------------------------

## 3.2. Phân hệ đa ngôn ngữ (I18N)

### I18N-SCR-001 -- Chọn ngôn ngữ

**Mục đích:** Cho phép người dùng chuyển ngôn ngữ giao diện/nội dung.

#### Trường dữ liệu

  ------------------------------------------------------------------------------
  Mã trường      Tên            Tên kỹ thuật       Kiểu           Giá trị
  -------------- -------------- ------------------ -------------- --------------
  I18N-FLD-001   Ngôn ngữ hiện  currentLanguage    Enum           VI/EN/JA/ZH
                 tại                                              

  I18N-FLD-002   Ngôn ngữ lựa   selectedLanguage   Enum           VI/EN/JA/ZH
                 chọn                                             

  I18N-FLD-003   Ngôn ngữ trình browserLanguage    String         Hệ thống nhận
                 duyệt                                            diện

  I18N-FLD-004   Ngôn ngữ tài   userLanguage       Enum           Đồng bộ tài
                 khoản                                            khoản học viên
  ------------------------------------------------------------------------------

#### Hành động

-   Chọn ngôn ngữ.
-   Áp dụng ngôn ngữ.
-   Ghi nhớ lựa chọn.
-   Tự nhận diện theo trình duyệt đối với khách chưa đăng nhập.

#### Quy tắc

-   **\[ĐÃ NÊU\]** Hỗ trợ VI, EN, JA, ZH.
-   **\[ĐÃ NÊU\]** Ghi nhớ lựa chọn và đồng bộ với tài khoản học viên.
-   **\[ĐÃ NÊU\]** Hỗ trợ định dạng ngày tháng, thời gian và tiền tệ
    theo ngôn ngữ.
-   **\[CHƯA QUY ĐỊNH\]** Thứ tự ưu tiên khi ngôn ngữ trình duyệt khác
    ngôn ngữ đã lưu; hành vi khi nội dung chưa có bản dịch.

#### Thông báo

  Mã             Nội dung                                       Loại
  -------------- ---------------------------------------------- ---------
  MSG-I18N-001   Ngôn ngữ đã được thay đổi                      SUCCESS
  MSG-I18N-002   Không thể tải nội dung theo ngôn ngữ đã chọn   ERROR
  MSG-I18N-003   Ngôn ngữ không được hỗ trợ                     ERROR

------------------------------------------------------------------------

## 3.3. Phân hệ LMS

### LMS-SCR-001 -- Danh sách khóa học

**Vai trò:** STUDENT, ADMIN.

#### Trường dữ liệu

  --------------------------------------------------------------------------
  Mã trường      Tên            Tên kỹ thuật   Kiểu           Ghi chú
  -------------- -------------- -------------- -------------- --------------
  LMS-FLD-001    Mã khóa học    courseId       ID/String      Model Course

  LMS-FLD-002    Tên khóa học   title          String         Model Course

  LMS-FLD-003    Danh mục       category       Relation/ID    Danh mục khóa
                                                              học

  LMS-FLD-004    Mô tả          description    Text           Model Course

  LMS-FLD-005    Hình ảnh       thumbnail      URL            Cần xác nhận

  LMS-FLD-006    Cấp độ         level          Enum/String    Có trong mô tả
                                                              Model Course

  LMS-FLD-007    Giảng viên     instructor     Relation       Có trong mô tả
                                                              Model Course

  LMS-FLD-008    Trạng thái     status         Enum           Tập giá trị
                                                              chưa quy định

  LMS-FLD-009    Tiến độ        progress       Number         Chỉ áp dụng
                                                              khóa học học
                                                              viên đã tham
                                                              gia
  --------------------------------------------------------------------------

#### Hành động

  -----------------------------------------------------------------------
  Mã                Tên               Vai trò           Xử lý
  ----------------- ----------------- ----------------- -----------------
  LMS-ACT-001       Tìm kiếm khóa học Cả hai            Tìm theo tiêu chí
                                                        được hỗ trợ

  LMS-ACT-002       Xem chi tiết      Cả hai            Mở LMS-SCR-002

  LMS-ACT-003       Đăng ký khóa học  STUDENT           Tạo đăng ký tham
                                                        gia

  LMS-ACT-004       Tạo khóa học      ADMIN             Mở LMS-SCR-003

  LMS-ACT-005       Chỉnh sửa khóa    ADMIN             Mở biểu mẫu cập
                    học                                 nhật

  LMS-ACT-006       Quản lý chương    ADMIN             Mở LMS-SCR-004
                    học                                 
  -----------------------------------------------------------------------

**Chưa quy định:** Điều kiện duyệt đăng ký, thanh toán, hủy đăng ký,
giới hạn học viên và bộ lọc/sắp xếp.

------------------------------------------------------------------------

### LMS-SCR-002 -- Chi tiết khóa học

**Thông tin:** Tên, mô tả, danh mục, cấp độ, giảng viên, cấu trúc Course
→ Module → Lesson → Components và tiến độ nếu người dùng đã đăng ký.

**Hành động:** Đăng ký khóa học; truy cập chương/bài học nếu đủ quyền;
quay lại danh sách.

**Validation/Business Rules:** - Học viên chỉ truy cập nội dung khóa học
đã tham gia theo quyền được cấp. - Cấu trúc nội dung theo Course →
Module → Lesson → Components. - Không tự suy ra điều kiện thanh toán
hoặc phê duyệt đăng ký khi SRS chưa quy định.

------------------------------------------------------------------------

### LMS-SCR-003 -- Tạo/cập nhật khóa học (ADMIN)

#### Trường dữ liệu

  --------------------------------------------------------------------------
  Mã             Tên            Tên kỹ thuật   Kiểu           Bắt buộc
                                gợi ý                         
  -------------- -------------- -------------- -------------- --------------
  LMS-FLD-010    Tên khóa học   title          String         Chưa quy định

  LMS-FLD-011    Danh mục       categoryId     ID/Select      Chưa quy định

  LMS-FLD-012    Mô tả          description    Text           Chưa quy định

  LMS-FLD-013    Cấp độ         level          Enum/String    Chưa quy định

  LMS-FLD-014    Giảng viên     instructorId   ID/Select      Chưa quy định

  LMS-FLD-015    Hình ảnh       thumbnail      File/URL       Chưa quy định

  LMS-FLD-016    Trạng thái     status         Enum           Chưa quy định

  LMS-FLD-017    Ngôn ngữ nội   language       Enum           VI/EN/JA/ZH
                 dung                                         nếu áp dụng
  --------------------------------------------------------------------------

**Lưu ý:** Các thuộc tính Course được suy ra từ mô tả Model Course và
chức năng quản lý khóa học. SRS chưa đưa ra danh sách field database
chính thức.

#### Hành động

-   Tạo mới.
-   Lưu thay đổi.
-   Xem trước.
-   Xuất bản/ẩn khóa học nếu trạng thái này được xác nhận.
-   Hủy.

#### Validation

-   Kiểm tra trường bắt buộc theo cấu hình đã được BA phê duyệt.
-   Kiểm tra danh mục/giảng viên tham chiếu tồn tại.
-   Kiểm tra định dạng file ảnh nếu có tải ảnh.
-   Điều kiện xuất bản cần được BA xác nhận.

------------------------------------------------------------------------

### LMS-SCR-004 -- Quản lý chương học (Module)

#### Trường dữ liệu

  Mã            Tên                 Tên kỹ thuật gợi ý   Kiểu
  ------------- ------------------- -------------------- ----------------
  LMS-FLD-018   Mã chương           moduleId             ID
  LMS-FLD-019   Tên chương          title                String
  LMS-FLD-020   Khóa học            courseId             Relation/ID
  LMS-FLD-021   Mô tả               description          Text
  LMS-FLD-022   Thứ tự              order                Integer
  LMS-FLD-023   Danh sách bài học   lessons              Array/Relation

#### Hành động

-   Thêm chương.
-   Chỉnh sửa chương.
-   Xóa chương.
-   Sắp xếp thứ tự chương.
-   Mở danh sách bài học.

#### Validation và ngoại lệ

-   Chương phải gắn với một khóa học.
-   Thứ tự chương phải là giá trị hợp lệ.
-   Quy tắc xóa chương khi đã có bài học chưa được SRS quy định; cần
    chốt xóa mềm, chặn xóa hoặc xử lý dữ liệu con.

------------------------------------------------------------------------

### LMS-SCR-005 -- Quản lý bài học (Lesson)

#### Trường dữ liệu

  ------------------------------------------------------------------------
  Mã                Tên                Tên kỹ thuật gợi  Kiểu
                                       ý                 
  ----------------- ------------------ ----------------- -----------------
  LMS-FLD-024       Mã bài học         lessonId          ID

  LMS-FLD-025       Tên bài học        title             String

  LMS-FLD-026       Chương học         moduleId          Relation/ID

  LMS-FLD-027       Nội dung           content           Rich Text/Text

  LMS-FLD-028       Thứ tự             order             Integer

  LMS-FLD-029       Học liệu           materials         Relation/Array

  LMS-FLD-030       Thành phần Quiz    quizzes           Relation/Array

  LMS-FLD-031       Thành phần         components        Relation/Array
                    Speaking/Writing                     

  LMS-FLD-032       Trạng thái         status            Enum
  ------------------------------------------------------------------------

#### Hành động

-   Tạo bài học.
-   Chỉnh sửa bài học.
-   Xóa bài học.
-   Sắp xếp bài học.
-   Gắn học liệu.
-   Gắn Quiz/Speaking/Writing.
-   Xem trước bài học.

**Validation:** Bài học phải thuộc một Module; kiểm tra dữ liệu bắt buộc
theo form được duyệt; kiểm tra thứ tự và quan hệ học liệu/thành phần.

------------------------------------------------------------------------

### LMS-SCR-006 -- Học nội dung bài học (STUDENT)

**Thông tin hiển thị:** Khóa học, chương, bài học, nội dung, học liệu,
Quiz và tiến độ.

**Hành động:** Mở học liệu; bắt đầu Quiz; truy cập Speaking/Writing;
chuyển bài trước/tiếp theo nếu có.

**Quy tắc tiến độ \[ĐÃ NÊU\]:** Tỷ lệ hoàn thành được tính dựa trên bài
học đã xem, Quiz đã vượt qua và bài Speaking/Writing đã nộp. Cách tính
trọng số, mẫu số và điều kiện xác định "đã xem" chưa được SRS mô tả.

------------------------------------------------------------------------

### LMS-SCR-007 -- Theo dõi tiến độ học tập

**Vai trò:** STUDENT xem tiến độ cá nhân; ADMIN giám sát tiến độ học
viên.

**Trường dữ liệu đề xuất:** Học viên, khóa học, tổng số bài học, số bài
đã xem, Quiz đạt, Speaking/Writing đã nộp, tỷ lệ hoàn thành, thời điểm
cập nhật.

**Hành động:** Xem chi tiết tiến độ theo khóa học; Admin lọc/xem tiến độ
học viên.

**Chưa quy định:** Công thức tỷ lệ hoàn thành, bộ lọc, cách xử lý bài bị
nộp lại hoặc Quiz làm nhiều lần.

------------------------------------------------------------------------

## 3.4. Kho học liệu số bảo mật (LIB)

### LIB-SCR-001 -- Danh sách học liệu (ADMIN)

#### Trường dữ liệu

  Mã            Tên             Tên kỹ thuật gợi ý   Kiểu
  ------------- --------------- -------------------- ---------------
  LIB-FLD-001   Mã học liệu     materialId           ID
  LIB-FLD-002   Tên học liệu    title                String
  LIB-FLD-003   Loại tài liệu   type                 Enum: PDF/MP3
  LIB-FLD-004   Tên file        fileName             String
  LIB-FLD-005   Dung lượng      fileSize             Number
  LIB-FLD-006   Khóa học        courseId             Relation
  LIB-FLD-007   Chương học      moduleId             Relation
  LIB-FLD-008   Bài học         lessonId             Relation
  LIB-FLD-009   Ngày tải lên    createdAt            DateTime
  LIB-FLD-010   Trạng thái      status               Enum

#### Hành động

-   Tìm kiếm/lọc học liệu.
-   Tải lên học liệu.
-   Xem chi tiết.
-   Chỉnh sửa thông tin.
-   Phân loại theo khóa/chương/bài.
-   Cấp quyền truy cập.
-   Quản lý file gốc.

**Quy tắc:** Admin tải lên PDF/MP3; học liệu được phân loại theo khóa
học, chương học và bài học; quyền truy cập được cấp cho học viên.

------------------------------------------------------------------------

### LIB-SCR-002 -- Tải lên/chỉnh sửa học liệu (ADMIN)

#### Trường dữ liệu

  Mã            Tên            Tên kỹ thuật gợi ý   Kiểu       Ghi chú
  ------------- -------------- -------------------- ---------- -------------------------
  LIB-FLD-011   Tên học liệu   title                String     
  LIB-FLD-012   File           file                 File       PDF hoặc MP3 \[ĐÃ NÊU\]
  LIB-FLD-013   Loại file      type                 Enum       PDF/MP3
  LIB-FLD-014   Khóa học       courseId             Relation   
  LIB-FLD-015   Chương học     moduleId             Relation   
  LIB-FLD-016   Bài học        lessonId             Relation   
  LIB-FLD-017   Mô tả          description          Text       \[ĐỀ XUẤT\]
  LIB-FLD-018   Trạng thái     status               Enum       \[ĐỀ XUẤT\]

#### Hành động

-   Chọn file.
-   Tải file lên.
-   Lưu thông tin học liệu.
-   Hủy thao tác.
-   Xem trước.
-   Cấp quyền truy cập.

#### Validation

-   Loại tài liệu hỗ trợ theo SRS là PDF và Audio MP3.
-   Kiểm tra file thực tế tương ứng loại được chọn.
-   Kiểm tra quan hệ khóa học/chương/bài.
-   Giới hạn dung lượng tối đa chưa được SRS quy định.
-   Quy tắc ghi đè file, phiên bản file và xóa file chưa được quy định.

#### Thông báo

  Mã            Nội dung                                   Loại
  ------------- ------------------------------------------ ------------
  MSG-LIB-001   Tải học liệu thành công                    SUCCESS
  MSG-LIB-002   Định dạng file không được hỗ trợ           VALIDATION
  MSG-LIB-003   Tải học liệu thất bại                      ERROR
  MSG-LIB-004   Bạn không có quyền truy cập học liệu này   ERROR
  MSG-LIB-005   Liên kết truy cập học liệu đã hết hạn      WARNING
  MSG-LIB-006   Cấp quyền truy cập học liệu thành công     SUCCESS

------------------------------------------------------------------------

### LIB-SCR-003 -- Trình xem PDF/Audio (STUDENT)

**Thông tin hiển thị:** Tên tài liệu, nội dung PDF hoặc Audio Player,
watermark định danh học viên.

**Trường dữ liệu/thuộc tính trình phát:** - Material ID. - Tên tài
liệu. - Loại tài liệu. - URL truy cập có chữ ký/token. - Thời hạn URL. -
Thông tin watermark: họ tên, số điện thoại, mã học viên. - Trạng thái
quyền truy cập.

**Hành động:** Xem PDF; chuyển trang/phóng to nếu viewer hỗ trợ;
phát/tạm dừng Audio; điều chỉnh âm lượng/tua nếu player hỗ trợ; đóng
trình xem.

**Quy tắc bảo mật \[ĐÃ NÊU\]:** - Tài liệu lưu trong khu vực riêng tư. -
Signed URL có thời hạn 15 phút. - Dynamic Watermark hiển thị họ tên, số
điện thoại và mã học viên; vị trí có thể thay đổi. - Không cung cấp chức
năng tải trực tiếp file học liệu gốc. - Hạn chế sao chép và tải xuống
trực tiếp.

**Chưa quy định:** Hành vi khi URL hết hạn trong lúc đang xem, tần suất
đổi vị trí watermark, chính sách in/clipboard và cơ chế gia hạn token.

------------------------------------------------------------------------

## 3.5. Lớp học trực tuyến WebRTC (CLASS)

### CLASS-SCR-001 -- Lịch và danh sách phòng học

**Vai trò:** STUDENT, ADMIN.

#### Trường dữ liệu

  Mã              Tên                      Tên kỹ thuật gợi ý   Kiểu
  --------------- ------------------------ -------------------- ---------------
  CLASS-FLD-001   Mã phòng                 roomId               ID
  CLASS-FLD-002   Tên phòng                name                 String
  CLASS-FLD-003   Khóa học/lớp liên quan   courseId             Relation
  CLASS-FLD-004   Host                     hostId               Relation/User
  CLASS-FLD-005   Thời gian bắt đầu        startAt              DateTime
  CLASS-FLD-006   Thời gian kết thúc       endAt                DateTime
  CLASS-FLD-007   Trạng thái phòng         status               Enum
  CLASS-FLD-008   Thông tin tham gia       joinInfo             Object/URL

**Hành động:** Xem lịch; tham gia phòng; Admin tạo phòng, thiết lập
lịch, chỉnh sửa thông tin và điều hành phòng.

**Chưa quy định:** Quy tắc trùng lịch, thời gian cho phép vào sớm, thời
gian đóng phòng và quy trình hủy lịch.

------------------------------------------------------------------------

### CLASS-SCR-002 -- Phòng học trực tuyến

**Quy mô \[ĐÃ NÊU\]:** 01 Admin làm Host và khoảng 6--8 học viên; nền
tảng LiveKit SFU và WebRTC.

**Thông tin hiển thị:** Danh sách người tham gia, trạng thái kết nối, âm
thanh, hình ảnh, trạng thái Microphone/Camera, chia sẻ màn hình, bảng
trắng.

#### Hành động STUDENT

-   Tham gia phòng theo lịch.
-   Bật/tắt Microphone.
-   Bật/tắt Camera.
-   Giơ tay.
-   Chia sẻ màn hình khi được cấp quyền.
-   Thao tác bảng trắng khi được cấp quyền.
-   Rời phòng.

#### Hành động ADMIN

-   Tạo và quản lý phòng.
-   Khởi tạo/điều hành phòng với quyền Host.
-   Bật/tắt Microphone và Camera của học viên.
-   Tắt tiếng hoặc loại học viên khỏi phòng.
-   Quản lý quyền bảng trắng.
-   Xóa nội dung bảng trắng.
-   Chia sẻ màn hình.

**Thông báo đề xuất, cần BA xác nhận nội dung hiển thị:**

  -----------------------------------------------------------------------
  Mã                      Nội dung                Loại
  ----------------------- ----------------------- -----------------------
  MSG-CLASS-001           Tham gia phòng học      SUCCESS
                          thành công              

  MSG-CLASS-002           Không thể kết nối phòng ERROR
                          học                     

  MSG-CLASS-003           Trình duyệt chưa được   WARNING
                          cấp quyền microphone    

  MSG-CLASS-004           Trình duyệt chưa được   WARNING
                          cấp quyền camera        

  MSG-CLASS-005           Bạn chưa được cấp quyền WARNING
                          thao tác bảng trắng     

  MSG-CLASS-006           Bạn đã bị đưa ra khỏi   WARNING
                          phòng học               

  MSG-CLASS-007           Phòng học đã kết thúc   INFO

  MSG-CLASS-008           Kết nối bị gián đoạn    WARNING
  -----------------------------------------------------------------------

------------------------------------------------------------------------

### CLASS-SCR-003 -- Bảng trắng tương tác

**Công cụ \[ĐÃ NÊU\]:** Vẽ tự do, viết chữ/nhập văn bản, Highlighter,
hình dạng cơ bản, chèn hình ảnh.

**Hành động:** Chọn công cụ; vẽ/viết; chèn hình; xóa nội dung theo
quyền; đồng bộ thao tác thời gian thực qua DataChannel.

**Quy tắc:** Học viên chỉ thao tác khi được Admin cấp quyền. Admin quản
lý quyền và có thể xóa nội dung bảng.

**Chưa quy định:** Kích thước file ảnh, định dạng ảnh, lịch sử
undo/redo, lưu bảng sau buổi học và quyền xóa riêng từng đối tượng.

------------------------------------------------------------------------

## 3.6. IELTS Writing AI (WR)

### WR-SCR-001 -- Danh sách đề Writing (STUDENT)

#### Trường dữ liệu

  Mã           Tên                 Tên kỹ thuật gợi ý   Kiểu
  ------------ ------------------- -------------------- ---------------------
  WR-FLD-001   Mã đề               promptId             ID
  WR-FLD-002   Tên đề              title                String
  WR-FLD-003   Loại Task           taskType             Enum: Task 1/Task 2
  WR-FLD-004   Nội dung đề         promptContent        Text
  WR-FLD-005   Hình ảnh đề         imageUrl             URL
  WR-FLD-006   Thời gian làm bài   duration             Integer
  WR-FLD-007   Trạng thái đề       status               Enum

**Hành động:** Xem đề; chọn Task 1/Task 2; bắt đầu làm bài.

**Chưa quy định:** Thời gian mặc định theo từng Task, số lần làm bài,
thời hạn đề và điều kiện mở đề.

------------------------------------------------------------------------

### WR-SCR-002 -- Làm bài Writing (STUDENT)

#### Trường dữ liệu

  ---------------------------------------------------------------------------
  Mã             Tên            Tên kỹ thuật    Kiểu           Ghi chú
                                gợi ý                          
  -------------- -------------- --------------- -------------- --------------
  WR-FLD-008     Đề bài         promptContent   Text           Hiển thị

  WR-FLD-009     Nội dung bài   content         Long Text      Học viên nhập
                 viết                                          

  WR-FLD-010     Số từ          wordCount       Integer        Hệ thống tính

  WR-FLD-011     Thời gian còn  remainingTime   Integer        Bộ đếm
                 lại                                           

  WR-FLD-012     Thời gian bắt  startedAt       DateTime       Hệ thống ghi
                 đầu                                           nhận

  WR-FLD-013     Trạng thái bài status          Enum           Trạng thái xử
                                                               lý
  ---------------------------------------------------------------------------

#### Hành động

-   Nhập bài viết.
-   Lưu bản nháp.
-   Nộp bài.
-   Xác nhận nộp bài.
-   Thoát màn hình.

#### Validation và quy tắc

-   Nội dung bài viết không được trống khi nộp.
-   Hệ thống theo dõi số lượng từ và bộ đếm thời gian.
-   Khi nộp, lưu bài và chuyển vào quy trình AI phân tích.
-   Kết quả chỉ được công bố sau khi Admin duyệt.
-   **Chưa quy định:** Số từ tối thiểu/tối đa, tự động lưu theo chu kỳ,
    cách xử lý hết giờ, cho phép sửa sau nộp hay không.

#### Thông báo

  -----------------------------------------------------------------------
  Mã                      Nội dung                Loại
  ----------------------- ----------------------- -----------------------
  MSG-WR-001              Vui lòng nhập nội dung  VALIDATION
                          bài viết                

  MSG-WR-002              Bạn có chắc chắn muốn   CONFIRM
                          nộp bài?                

  MSG-WR-003              Nộp bài thành công      SUCCESS

  MSG-WR-004              Bài viết đang được AI   INFO
                          phân tích               

  MSG-WR-005              Không thể phân tích bài ERROR
                          viết. Vui lòng thử lại  
                          hoặc liên hệ hỗ trợ     

  MSG-WR-006              Bài viết đang chờ Admin INFO
                          phê duyệt               

  MSG-WR-007              Kết quả chấm bài đã     SUCCESS
                          được công bố            
  -----------------------------------------------------------------------

------------------------------------------------------------------------

### WR-SCR-003 -- Danh sách bài Writing chờ duyệt (ADMIN)

**Trường dữ liệu:** Mã bài nộp, học viên, đề bài, thời gian nộp, trạng
thái AI, trạng thái duyệt.

**Hành động:** Tìm kiếm/lọc bài nộp; xem bài; xem kết quả AI; mở màn
hình chấm/duyệt.

**Chưa quy định:** Bộ lọc, thứ tự ưu tiên, phân công người chấm và thời
hạn xử lý.

------------------------------------------------------------------------

### WR-SCR-004 -- Chi tiết và duyệt kết quả Writing (ADMIN)

#### Trường dữ liệu

  ---------------------------------------------------------------------------------
  Mã                Tên                Tên kỹ thuật gợi ý         Kiểu
  ----------------- ------------------ -------------------------- -----------------
  WR-FLD-014        Task               taskAchievementResponse    Number
                    Achievement/Task                              
                    Response                                      

  WR-FLD-015        Coherence and      coherenceCohesion          Number
                    Cohesion                                      

  WR-FLD-016        Lexical Resource   lexicalResource            Number

  WR-FLD-017        Grammatical Range  grammaticalRangeAccuracy   Number
                    and Accuracy                                  

  WR-FLD-018        Overall Band       overallBand                Number

  WR-FLD-019        Nhận xét chi tiết  feedback                   Text

  WR-FLD-020        Gợi ý từ vựng      vocabularySuggestions      Text
                    C1/C2                                         

  WR-FLD-021        Bài viết tham khảo sampleEssay                Text
                    Band 8.0+                                     

  WR-FLD-022        Người duyệt        reviewerId                 User/ID

  WR-FLD-023        Thời gian duyệt    reviewedAt                 DateTime
  ---------------------------------------------------------------------------------

#### Hành động

-   Xem bài viết gốc.
-   Xem kết quả AI.
-   Chỉnh sửa điểm.
-   Chỉnh sửa nhận xét.
-   Lưu kết quả.
-   Phê duyệt.
-   Công bố kết quả.

#### Validation

-   Điểm từng tiêu chí và Overall Band phải theo thang điểm IELTS được
    thống nhất.
-   Nhận xét phải đáp ứng điều kiện bắt buộc trước khi công bố nếu BA
    quy định.
-   Chỉ Admin có quyền duyệt.
-   Không công bố kết quả khi chưa phê duyệt.

**Chưa quy định:** Công thức Overall Band, cách làm tròn, điểm lẻ được
phép, trạng thái từ chối và quy trình yêu cầu học viên nộp lại.

------------------------------------------------------------------------

### WR-SCR-005 -- Kết quả Writing (STUDENT)

**Thông tin hiển thị:** Điểm bốn tiêu chí, Overall Band, nhận xét, gợi ý
từ vựng C1/C2, bài mẫu Band 8.0+.

**Điều kiện truy cập:** Chỉ hiển thị kết quả sau khi Admin phê
duyệt/công bố.

**Hành động:** Xem kết quả; xem lại bài đã nộp.

------------------------------------------------------------------------

## 3.7. IELTS Speaking (SP)

### SP-SCR-001 -- Danh sách đề Speaking (STUDENT)

**Trường dữ liệu:** Mã đề, tên đề, Part, nội dung câu hỏi, hướng dẫn,
Audio mẫu (nếu có), trạng thái.

**Hành động:** Xem đề; nghe Audio mẫu; bắt đầu ghi âm.

**Chưa quy định:** Cấu trúc Part cụ thể, thời gian chuẩn bị/trả lời, số
lần ghi âm.

------------------------------------------------------------------------

### SP-SCR-002 -- Ghi âm và nộp Speaking (STUDENT)

**Trường dữ liệu/thuộc tính:** - Đề/câu hỏi đang trả lời. - Trạng thái
quyền Microphone. - Trạng thái ghi âm. - Sóng âm trực quan. - Thời lượng
ghi âm. - File ghi âm. - Bản ghi nghe lại.

**Hành động:** Bắt đầu ghi âm; kết thúc; nghe lại; ghi âm lại; nộp bản
ghi.

**Quy tắc \[ĐÃ NÊU\]:** - Ghi âm trực tiếp trên trình duyệt. - Hiển thị
sóng âm và thời gian thực. - Học viên có thể nghe lại và ghi âm lại nếu
chưa hài lòng. - Nộp bản ghi cho Admin đánh giá. - Speaking do Admin
trực tiếp nghe và chấm, không dùng AI tự động chấm.

**Chưa quy định:** Định dạng file, dung lượng tối đa, thời lượng tối
đa/tối thiểu, số lần ghi lại và cách xử lý mất kết nối.

------------------------------------------------------------------------

### SP-SCR-003 -- Danh sách bài Speaking chờ chấm (ADMIN)

**Trường dữ liệu:** Mã bài nộp, học viên, đề Speaking, thời gian nộp,
trạng thái chấm.

**Hành động:** Tìm kiếm/lọc; mở bản ghi; chuyển đến màn hình chấm.

------------------------------------------------------------------------

### SP-SCR-004 -- Nghe và chấm Speaking (ADMIN)

#### Trường dữ liệu

  --------------------------------------------------------------------------------
  Mã                Tên               Tên kỹ thuật gợi ý         Kiểu
  ----------------- ----------------- -------------------------- -----------------
  SP-FLD-001        Fluency and       fluencyCoherence           Number
                    Coherence                                    

  SP-FLD-002        Lexical Resource  lexicalResource            Number

  SP-FLD-003        Grammatical Range grammaticalRangeAccuracy   Number
                    and Accuracy                                 

  SP-FLD-004        Pronunciation     pronunciation              Number

  SP-FLD-005        Overall Band      overallBand                Number

  SP-FLD-006        Nhận xét tổng     feedback                   Text
                    quan                                         

  SP-FLD-007        Mốc thời gian     timestamp                  Time

  SP-FLD-008        Nhận xét tại mốc  timestampComment           Text
                    thời gian                                    
  --------------------------------------------------------------------------------

#### Hành động

-   Phát/tạm dừng Audio.
-   Điều chỉnh tốc độ phát.
-   Tua vị trí.
-   Tua tiến/lùi 5 giây.
-   Thêm/sửa nhận xét tại timestamp.
-   Nhập điểm bốn tiêu chí.
-   Nhập Overall Band.
-   Lưu và phát hành kết quả.

#### Validation

-   Điểm phải thuộc thang IELTS được thống nhất.
-   Timestamp nằm trong thời lượng bản ghi.
-   Nhận xét tại timestamp phải gắn với một mốc hợp lệ.
-   Chỉ Admin được lưu/phát hành kết quả.

**Chưa quy định:** Công thức Overall Band, cách làm tròn, số lượng nhận
xét tối đa và việc có bắt buộc nhận xét theo timestamp hay không.

------------------------------------------------------------------------

### SP-SCR-005 -- Kết quả Speaking (STUDENT)

**Thông tin:** Điểm bốn tiêu chí, Overall Band, nhận xét và các nhận xét
theo timestamp.

**Điều kiện:** Chỉ xem sau khi Admin hoàn tất và phát hành kết quả.

------------------------------------------------------------------------

## 3.8. Quiz Engine (QZ)

### QZ-SCR-001 -- Danh sách bài kiểm tra

**Trường dữ liệu:** Mã Quiz, tên bài kiểm tra, bài học liên quan, số câu
hỏi, thời gian làm bài, điểm sàn, trạng thái.

**Hành động STUDENT:** Bắt đầu làm bài; xem kết quả.

**Hành động ADMIN:** Tạo, chỉnh sửa, quản lý bài kiểm tra.

------------------------------------------------------------------------

### QZ-SCR-002 -- Làm bài kiểm tra (STUDENT)

**Trường dữ liệu:** - Tên bài kiểm tra. - Thời gian làm bài và thời gian
còn lại. - Danh sách câu hỏi. - Loại câu hỏi. - Nội dung câu hỏi. - Danh
sách lựa chọn. - Đáp án học viên chọn/nhập. - Trạng thái câu hỏi.

**Loại câu hỏi \[ĐÃ NÊU\]:** - Single Choice. - Multiple Choice. - Fill
in the Blanks.

#### Hành động

-   Chọn một đáp án.
-   Chọn nhiều đáp án.
-   Nhập câu trả lời.
-   Chuyển câu trước/tiếp theo nếu giao diện hỗ trợ.
-   Nộp bài.
-   Xác nhận nộp bài.

#### Validation và quy tắc

-   Single Choice: chỉ chọn một đáp án.
-   Multiple Choice: cho phép chọn nhiều đáp án.
-   Fill in the Blanks: kiểm tra câu trả lời theo đáp án được cấu hình.
-   Có đồng hồ bấm giờ.
-   Hệ thống tự động chấm và hiển thị điểm, trạng thái Đạt/Không đạt,
    lời giải thích.
-   Bài học tiếp theo tự động mở khóa theo điều kiện Quiz.

**Chưa quy định:** Cách tính điểm câu nhiều đáp án, xử lý câu bỏ trống,
thời điểm tự động nộp khi hết giờ, số lần làm lại, thứ tự câu hỏi và
việc xáo trộn câu/đáp án.

------------------------------------------------------------------------

### QZ-SCR-003 -- Kết quả Quiz (STUDENT)

**Trường dữ liệu:** Điểm số, điểm sàn, trạng thái Đạt/Không đạt, tổng
câu, câu đúng/sai, lời giải thích đáp án, thời gian hoàn thành.

**Hành động:** Xem chi tiết đáp án; xem giải thích; tiếp tục bài học nếu
đạt điều kiện.

**Quy tắc:** Điểm và trạng thái được hệ thống tự động tính. Bài học tiếp
theo mở khóa theo điều kiện đã cấu hình.

------------------------------------------------------------------------

### QZ-SCR-004 -- Quản lý Quiz (ADMIN)

**Trường dữ liệu:** Tên Quiz, bài học liên kết, thời gian làm bài, điểm
sàn, danh sách câu hỏi, trạng thái.

**Hành động:** Tạo Quiz; chỉnh sửa; xóa; cấu hình thời gian; cấu hình
điểm đạt; quản lý đáp án và lời giải.

**Validation:** Thời gian và điểm sàn phải hợp lệ theo cấu hình được BA
duyệt; Quiz cần có câu hỏi hợp lệ trước khi đưa vào sử dụng.

------------------------------------------------------------------------

### QZ-SCR-005 -- Quản lý ngân hàng câu hỏi (ADMIN)

**Trường dữ liệu:** Mã câu hỏi, nội dung, loại câu hỏi, phương án, đáp
án đúng, lời giải thích, điểm câu hỏi.

**Hành động:** Thêm/sửa/xóa câu hỏi; thêm/sửa/xóa phương án; cấu hình
đáp án; lưu.

**Validation:** - Nội dung câu hỏi không được trống. - Single Choice cần
đúng một đáp án theo cấu hình. - Multiple Choice cần ít nhất một đáp án
đúng. - Fill in the Blanks cần đáp án đối chiếu. - Chi tiết cách so khớp
câu trả lời điền khuyết chưa được SRS quy định.

------------------------------------------------------------------------

### QZ-SCR-006 -- Báo cáo chẩn đoán năng lực 4 Kỹ năng & Phân tích điểm yếu (STUDENT, ADMIN)

#### 1. Hệ thống phân loại 4 Kỹ năng (4 Skills Taxonomy):
- **READING**: Đọc hiểu chuyên sâu theo các bài đọc Passage.
- **LISTENING**: Nghe hiểu tích hợp audio Cloudinary và bài tập nghe điền từ / sơ đồ.
- **WRITING**: Luyện viết Task 1 & Task 2 tích hợp chấm điểm AI Gemini.
- **SPEAKING**: Ghi âm studio và chấm điểm 4 tiêu chí từ Admin.

#### 2. Phân loại chi tiết dạng câu hỏi (Question Types):
- **Dạng bài Reading**:
  - `MATCHING_HEADINGS`: Nối tiêu đề đoạn văn (đánh giá kỹ năng Skimming, nắm bắt Topic Sentence).
  - `TRUE_FALSE_NOT_GIVEN` / `YES_NO_NOT_GIVEN`: Xác định tính đúng/sai/không đề cập (phân biệt Fact vs Claim).
  - `MATCHING_INFORMATION` / `MATCHING_FEATURES`: Nối thông tin chi tiết / đặc điểm đối tượng.
  - `SENTENCE_COMPLETION` / `SUMMARY_COMPLETION`: Điền từ hoàn thành câu / bản tóm tắt.
  - `MULTIPLE_CHOICE`: Trắc nghiệm 1 hoặc nhiều đáp án (phân tích bẫy Distractors).
- **Dạng bài Listening**:
  - `NOTE_COMPLETION` / `FORM_COMPLETION`: Nghe điền thông tin biểu mẫu / ghi chú.
  - `MAP_DIAGRAM_LABELING`: Nghe định hướng và điền nhãn sơ đồ bản đồ.
  - `FLOW_CHART_COMPLETION`: Nghe quy trình các bước.
  - `SHORT_ANSWER`: Trả lời ngắn theo giới hạn số từ.

#### 3. Chức năng phân tích hiển thị Frontend (Diagnostic Analytics):
- **Thống kê theo 4 kỹ năng (`skillsBreakdown`)**: Tổng số câu đã làm, số câu đúng, số câu sai, tỷ lệ chính xác %, điểm Band trung bình.
- **Phân loại theo từng dạng bài (`questionTypesBreakdown`)**:
  - Tỷ lệ đúng %, tỷ lệ sai sót %.
  - Xếp loại năng lực: `STRONG` (&ge; 80%), `MODERATE` (50% - 79%), `WEAK` (< 50%).
- **Danh sách điểm yếu hay làm sai (`weaknesses`)**:
  - Tự động sắp xếp các dạng bài có tỷ lệ sai cao nhất lên đầu.
  - Đưa ra lời khuyên sư phạm riêng biệt (`recommendation`) cho từng dạng câu hỏi (Ví dụ: cách phân biệt False và Not Given; cách Skimming tìm Topic Sentence cho Matching Headings).
- **Danh sách thế mạnh làm đúng (`strengths`)**:
  - Liệt kê các dạng câu hỏi học viên thành thạo nhất (&ge; 80%).
- **Đặc quyền ADMIN**:
  - Xem tổng quan toàn học viện (`GET /api/quizzes/diagnostic/admin/overview`), phát hiện 5 dạng câu hỏi học sinh hay sai sót nhất toàn trường.
  - Tra cứu hồ sơ chẩn đoán chi tiết của từng học viên cụ thể (`GET /api/quizzes/diagnostic/students/:studentId`).

------------------------------------------------------------------------

## 3.9. Điểm danh tự động (ATT)

### ATT-SCR-001 -- Danh sách/báo cáo điểm danh (ADMIN)

#### Trường dữ liệu

  Mã            Tên                       Tên kỹ thuật gợi ý   Kiểu
  ------------- ------------------------- -------------------- ----------
  ATT-FLD-001   Mã bản ghi                attendanceRecordId   ID
  ATT-FLD-002   Học viên                  studentId            Relation
  ATT-FLD-003   Phòng học                 roomId               Relation
  ATT-FLD-004   Thời điểm vào             joinedAt             DateTime
  ATT-FLD-005   Thời điểm ra              leftAt               DateTime
  ATT-FLD-006   Tổng thời gian tham gia   attendedDuration     Integer
  ATT-FLD-007   Thời lượng buổi học       sessionDuration      Integer
  ATT-FLD-008   Trạng thái                attendanceStatus     Enum
  ATT-FLD-009   Ghi chú                   note                 Text

#### Hành động

-   Xem danh sách.
-   Lọc theo buổi/học viên/trạng thái nếu được cấu hình.
-   Xem log vào/ra.
-   Điều chỉnh thủ công.
-   Thêm ghi chú.
-   Xuất Excel (.xlsx).

#### Quy tắc chuyên cần \[ĐÃ NÊU\]

-   PRESENT: tham gia trong 15 phút đầu và thời gian học đạt ít nhất 80%
    thời lượng buổi học.
-   LATE: tham gia sau 15 phút đầu của buổi học.
-   ABSENT: không tham gia hoặc thời gian tham gia dưới 30% thời lượng
    buổi học.
-   Dữ liệu ghi nhận thông qua sự kiện kết nối/ngắt kết nối từ LiveKit
    Webhook.
-   Admin có quyền xem log, điều chỉnh thủ công kèm ghi chú và xuất
    Excel.

**Điểm chưa rõ cần BA quyết định:** Khoảng tham gia từ 30% đến dưới 80%;
trường hợp vào muộn nhưng tham gia đủ 80%; nhiều lần vào/ra; mất kết nối
ngắn; cách tính tổng thời gian khi có nhiều phiên kết nối.

------------------------------------------------------------------------

### ATT-SCR-002 -- Chi tiết và điều chỉnh điểm danh (ADMIN)

**Trường dữ liệu:** Học viên, phòng học, log vào/ra, tổng thời gian,
trạng thái hệ thống, trạng thái điều chỉnh, ghi chú, người điều chỉnh,
thời gian điều chỉnh.

**Hành động:** Chọn trạng thái mới; nhập lý do; lưu; hủy; xem lịch sử
thay đổi nếu có triển khai.

**Validation đề xuất:** - Trạng thái mới phải thuộc danh sách trạng thái
hợp lệ. - Bắt buộc nhập lý do khi điều chỉnh. - Ghi nhận người thực hiện
và thời gian điều chỉnh để truy vết.

------------------------------------------------------------------------

## 3.10. Dashboard (DASH)

### DASH-SCR-001 -- Dashboard học viên

**Thông tin hiển thị \[ĐÃ NÊU\]:** - Khóa học đang học. - Tỷ lệ hoàn
thành. - Lịch học trực tuyến sắp tới. - Nút vào phòng nhanh. - Bài tập
cần nộp. - Kết quả chấm điểm mới nhất.

**Trường dữ liệu tổng hợp:** Danh sách khóa học/tiến độ, lịch học, bài
tập, kết quả Writing/Speaking/Quiz.

**Hành động:** Tiếp tục học; xem khóa học; vào phòng học; mở bài tập;
xem kết quả.

**Quy tắc:** Chỉ hiển thị dữ liệu thuộc học viên hiện tại.

------------------------------------------------------------------------

### DASH-SCR-002 -- Dashboard Admin

**Thông tin hiển thị \[ĐÃ NÊU\]:** - Tổng số học viên active. - Số khóa
học. - Số bài Writing chờ duyệt. - Số bài Speaking chờ chấm. - Tỷ lệ
chuyên cần gần đây. - Tiến độ chung.

**Hành động:** Mở danh sách tương ứng để quản lý/đối soát.

**Chưa quy định:** Định nghĩa "active", khoảng thời gian của "gần đây",
công thức tỷ lệ chuyên cần, bộ lọc theo khóa học/lớp và tần suất cập
nhật số liệu.

------------------------------------------------------------------------

## 3.11. Nhắn tin và hỗ trợ trực tuyến (CHAT)

### CHAT-SCR-001 -- Danh sách hội thoại

**Trường dữ liệu đề xuất:** Mã hội thoại, người tham gia, tin nhắn cuối,
thời gian tin cuối, số tin chưa đọc.

**Hành động:** Mở hội thoại; tìm kiếm nếu có hỗ trợ.

**Chưa quy định:** Học viên có thể chủ động tạo hội thoại hay chỉ nhắn
Admin qua một kênh hỗ trợ cố định; quy tắc đóng/lưu trữ hội thoại.

------------------------------------------------------------------------

### CHAT-SCR-002 -- Chi tiết hội thoại

**Trường dữ liệu:** Mã hội thoại, người gửi, người nhận, nội dung, thời
gian gửi, trạng thái đã đọc.

**Hành động:** Nhập nội dung; gửi; nhận tin nhắn realtime; đánh dấu đã
đọc.

**Quy tắc \[ĐÃ NÊU\]:** - Sử dụng Socket.IO. - Lưu lịch sử hội thoại
trong cơ sở dữ liệu. - Phân quyền dữ liệu nghiêm ngặt.

**Validation:** Không gửi nội dung rỗng là quy tắc đề xuất cần xác nhận;
giới hạn độ dài, loại tệp đính kèm và chính sách xóa tin nhắn chưa được
SRS quy định.

------------------------------------------------------------------------

## 3.12. Quản lý Blog & Media Cloudinary (BLOG & MEDIA)

### BLOG-SCR-001 -- Danh sách & Chi tiết bài viết Blog (STUDENT, GUEST, ADMIN)
- **Mục tiêu:** Cung cấp kho bài viết kiến thức, phương pháp học IELTS, bí quyết luyện thi, tin tức học viện kèm hình ảnh và video minh họa.
- **Trường dữ liệu:** Tiêu đề, slug URL thân thiện, tóm tắt, nội dung chi tiết (Markdown/HTML), ảnh bìa Cloudinary (coverImage), video Cloudinary (videoUrl), chuyên mục (category), từ khóa (tags), tác giả, ngày xuất bản, số lượt xem (viewCount), đánh dấu nổi bật (isFeatured).
- **Phân quyền:**
  - Khách và Học viên (`STUDENT`): Tra cứu các bài viết có trạng thái `PUBLISHED`.
  - Quản trị viên (`ADMIN`): Tra cứu tất cả bài viết bao gồm `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- **Hành động:** Tìm kiếm bài viết theo từ khóa; lọc theo chuyên mục; xem chi tiết bài viết; tự động tăng lượt xem viewCount.

### BLOG-SCR-002 -- Soạn thảo & Quản trị bài viết Blog (ADMIN)
- **Mục tiêu:** Quản trị viên tạo mới, chỉnh sửa, xuất bản và xóa bài viết.
- **Hành động:**
  - Đăng bài viết mới kèm file ảnh bìa (multipart `coverImage`) và file video (multipart `video`).
  - Cập nhật nội dung bài viết, thay đổi trạng thái (DRAFT -> PUBLISHED -> ARCHIVED).
  - Tải lên ảnh bìa riêng (`POST /api/blogs/:id/cover`) hoặc video riêng (`POST /api/blogs/:id/video`).
  - Xóa bài viết và tự động dọn dẹp tài nguyên tương ứng trên Cloudinary.

### MEDIA-SVC-001 -- Hạ tầng Lưu trữ & Phân phối Media Cloudinary
- **Mục tiêu:** Tập trung hóa việc xử lý và lưu trữ toàn bộ ảnh và video trên hệ thống qua dịch vụ đám mây Cloudinary.
- **Phạm vi áp dụng:**
  1. **Blog:** Lưu trữ ảnh bìa (`coverImage`) và video phân tích bài học (`videoUrl`).
  2. **Người dùng:** Upload và cập nhật ảnh đại diện học viên & giảng viên (`avatarUrl` qua `POST /api/users/:id/avatar`).
  3. **Khóa học:** Upload và quản lý ảnh thumbnail khóa học (`thumbnail` qua `POST /api/courses/:id/thumbnail`).
  4. **Bài học:** Upload và stream video bài giảng chất lượng cao (`videoUrl` qua `POST /api/lessons/:id/video`).
  5. **Media API chung:** Endpoint upload độc lập `POST /api/media/upload/image` và `POST /api/media/upload/video`.

------------------------------------------------------------------------

# 4. Đặc tả nút chức năng -- quy tắc chung

## 4.1. Các loại hành động

  -----------------------------------------------------------------------
  Loại hành động                      Hành vi cần đặc tả
  ----------------------------------- -----------------------------------
  Create                              Tạo bản ghi mới; kiểm tra dữ liệu;
                                      trả về kết quả

  Read/View                           Kiểm tra quyền và tải dữ liệu

  Update                              Kiểm tra quyền, trạng thái và dữ
                                      liệu cập nhật

  Delete                              Xác nhận; kiểm tra quan hệ dữ liệu;
                                      quy định xóa mềm/xóa cứng

  Submit                              Kiểm tra điều kiện nộp; khóa/chuyển
                                      trạng thái theo nghiệp vụ

  Approve                             Kiểm tra quyền và trạng thái trước
                                      khi duyệt

  Publish                             Kiểm tra điều kiện công bố; thay
                                      đổi khả năng truy cập

  Export                              Kiểm tra quyền và tạo file theo
                                      định dạng yêu cầu

  Realtime action                     Kiểm tra kết nối, quyền và đồng bộ
                                      trạng thái
  -----------------------------------------------------------------------

## 4.2. Mẫu đặc tả chi tiết một nút

  Thuộc tính         Mô tả
  ------------------ --------------------------------------
  Action ID          Mã hành động
  Screen ID          Màn hình
  Action Name        Tên nút
  Role               Vai trò được phép
  Trigger            Click/submit/keyboard/realtime event
  Pre-condition      Điều kiện trước khi chạy
  Input              Dữ liệu đầu vào
  Processing         Các bước xử lý
  Post-condition     Trạng thái sau xử lý
  Success Message    Mã thông báo thành công
  Error Message      Mã thông báo lỗi
  Confirmation       Có/Không
  Permission Check   Quy tắc phân quyền

## 4.3. Ví dụ: Nút Nộp bài Writing

  -----------------------------------------------------------------------
  Thuộc tính                          Nội dung
  ----------------------------------- -----------------------------------
  Action ID                           WR-ACT-SUBMIT

  Screen ID                           WR-SCR-002

  Action Name                         Nộp bài

  Role                                STUDENT

  Trigger                             Click

  Pre-condition                       Bài đang ở trạng thái cho phép nộp

  Input                               Nội dung bài viết, mã đề

  Processing                          Kiểm tra quyền, trạng thái và nội
                                      dung; lưu bài; khởi chạy quy trình
                                      AI

  Post-condition                      Bài được ghi nhận đã nộp/đang xử lý

  Confirmation                        Đề xuất có hộp xác nhận

  Success Message                     MSG-WR-003

  Error Message                       MSG-WR-001, MSG-WR-005
  -----------------------------------------------------------------------

**Luồng xử lý:** 1. Học viên chọn Nộp bài. 2. Hệ thống hiển thị xác nhận
nếu quy trình được duyệt có bước xác nhận. 3. Hệ thống kiểm tra quyền,
mã đề, trạng thái bài và nội dung. 4. Backend lưu bài nộp. 5. Backend
khởi chạy AI Writing Assessment. 6. Hệ thống cập nhật trạng thái xử lý.
7. Admin xem kết quả AI, điều chỉnh nếu cần và phê duyệt. 8. Học viên
xem kết quả sau khi được công bố.

------------------------------------------------------------------------

# 5. Quy tắc kiểm tra dữ liệu (Validation Rules)

## 5.1. Phân loại Validation

  -----------------------------------------------------------------------
  Loại                    Mục đích                Ví dụ
  ----------------------- ----------------------- -----------------------
  Required                Kiểm tra bắt buộc       Email không được trống

  Format                  Kiểm tra định dạng      Email đúng định dạng

  Min/Max Length          Độ dài                  Độ dài mật khẩu

  Min/Max Value           Khoảng giá trị          Điểm nằm trong thang
                                                  cho phép

  Unique                  Không trùng             Email chưa tồn tại

  Referential Integrity   Quan hệ dữ liệu         Module thuộc Course tồn
                                                  tại

  File Validation         Tệp tải lên             PDF/MP3

  Date/Time               Ngày giờ                Thời điểm kết thúc sau
                                                  bắt đầu

  Cross-field             Quan hệ giữa trường     Xác nhận mật khẩu trùng
                                                  mật khẩu

  Business Validation     Điều kiện nghiệp vụ     Chỉ công bố Writing sau
                                                  duyệt

  Permission Validation   Phân quyền              Chỉ Admin được duyệt

  State Validation        Trạng thái              Không nộp lại khi trạng
                                                  thái không cho phép
  -----------------------------------------------------------------------

## 5.2. Danh sách Validation ban đầu

  --------------------------------------------------------------------------
  Validation ID  Phân hệ        Đối tượng      Điều kiện      Mã thông báo
  -------------- -------------- -------------- -------------- --------------
  VAL-AUTH-001   AUTH           Email đăng ký  Bắt buộc       MSG-AUTH-001

  VAL-AUTH-002   AUTH           Email đăng ký  Đúng định dạng MSG-AUTH-002

  VAL-AUTH-003   AUTH           Email đăng ký  Chưa tồn tại   MSG-AUTH-003

  VAL-AUTH-004   AUTH           Mật khẩu       Bắt buộc       MSG-AUTH-004

  VAL-AUTH-005   AUTH           Xác nhận mật   Trùng mật khẩu MSG-AUTH-005
                                khẩu           nếu áp dụng    

  VAL-AUTH-006   AUTH           Đăng nhập      Đủ thông tin   MSG-AUTH-010
                                               xác thực       

  VAL-LMS-001    LMS            Khóa học       Trường bắt     Cần định nghĩa
                                               buộc theo form 
                                               được duyệt     

  VAL-LMS-002    LMS            Khóa học       Danh mục/giảng Cần định nghĩa
                                               viên tham      
                                               chiếu tồn tại  

  VAL-LMS-003    LMS            Module         Thuộc Course   Cần định nghĩa
                                               hợp lệ         

  VAL-LMS-004    LMS            Lesson         Thuộc Module   Cần định nghĩa
                                               hợp lệ         

  VAL-LIB-001    LIB            File học liệu  Loại PDF hoặc  MSG-LIB-002
                                               MP3            

  VAL-LIB-002    LIB            Truy cập học   Người dùng có  MSG-LIB-004
                                liệu           quyền          

  VAL-LIB-003    LIB            Signed URL     Token còn hiệu MSG-LIB-005
                                               lực            

  VAL-WR-001     WR             Bài viết       Nội dung không MSG-WR-001
                                               trống khi nộp  

  VAL-WR-002     WR             Kết quả        Điểm theo      Cần định nghĩa
                                Writing        thang được     
                                               duyệt          

  VAL-WR-003     WR             Công bố        Đã được Admin  Cần định nghĩa
                                               phê duyệt      

  VAL-SP-001     SP             Ghi âm         Có bản ghi hợp Cần định nghĩa
                                               lệ trước khi   
                                               nộp            

  VAL-SP-002     SP             Timestamp      Nằm trong thời Cần định nghĩa
                                               lượng audio    

  VAL-SP-003     SP             Điểm Speaking  Theo thang     Cần định nghĩa
                                               được duyệt     

  VAL-QZ-001     QZ             Single Choice  Chỉ một đáp án Cần định nghĩa
                                               được chọn      

  VAL-QZ-002     QZ             Multiple       Cho phép nhiều Cần định nghĩa
                                Choice         đáp án         

  VAL-QZ-003     QZ             Fill in the    Có dữ liệu trả Cần định nghĩa
                                Blanks         lời/đáp án đối 
                                               chiếu          

  VAL-ATT-001    ATT            Điều chỉnh     Trạng thái     Cần định nghĩa
                                               thuộc tập hợp  
                                               hợp lệ         

  VAL-ATT-002    ATT            Điều chỉnh     Có ghi chú/lý  Cần định nghĩa
                                               do nếu quy     
                                               định bắt buộc  

  VAL-CHAT-001   CHAT           Tin nhắn       Nội dung hợp   Cần định nghĩa
                                               lệ, không rỗng 
                                               nếu BA xác     
                                               nhận           
  --------------------------------------------------------------------------

## 5.3. Nguyên tắc thực thi Validation

-   Frontend kiểm tra sớm để hỗ trợ người dùng.
-   Backend phải kiểm tra lại dữ liệu và quyền; không tin dữ liệu từ
    Frontend.
-   Validation nghiệp vụ phải dùng chung quy tắc giữa các API liên quan.
-   Lỗi cần trả về mã có thể đối chiếu với Message Catalog.
-   Không tự đặt giới hạn độ dài, dung lượng, số lần, thời gian hoặc
    ngưỡng điểm khi chưa có quyết định nghiệp vụ.

------------------------------------------------------------------------

# 6. Danh sách thông báo (Message Catalog)

## 6.1. Quy ước

  Thuộc tính   Ý nghĩa
  ------------ -----------------------------------------------
  Message ID   Mã duy nhất
  Module       Phân hệ
  Type         SUCCESS/ERROR/WARNING/INFO/VALIDATION/CONFIRM
  Content VI   Nội dung tiếng Việt gốc
  Trigger      Điều kiện xuất hiện
  Display      Inline/Toast/Modal/Banner -- cần chốt theo UI

Các thông báo bên dưới là nội dung đề xuất để chuẩn hóa giao diện; cần
rà soát với khách hàng và bản dịch VI/EN/JA/ZH.

## 6.2. AUTH

  -----------------------------------------------------------------------
  Message ID              Type                    Nội dung VI
  ----------------------- ----------------------- -----------------------
  MSG-AUTH-001            VALIDATION              Vui lòng nhập email

  MSG-AUTH-002            VALIDATION              Email không đúng định
                                                  dạng

  MSG-AUTH-003            ERROR                   Email đã được sử dụng

  MSG-AUTH-004            VALIDATION              Vui lòng nhập mật khẩu

  MSG-AUTH-005            VALIDATION              Mật khẩu xác nhận không
                                                  khớp

  MSG-AUTH-006            SUCCESS                 Đăng ký tài khoản thành
                                                  công

  MSG-AUTH-007            ERROR                   Không thể đăng ký tài
                                                  khoản. Vui lòng thử lại

  MSG-AUTH-008            VALIDATION              Vui lòng nhập email

  MSG-AUTH-009            VALIDATION              Vui lòng nhập mật khẩu

  MSG-AUTH-010            ERROR                   Email hoặc mật khẩu
                                                  không chính xác

  MSG-AUTH-011            ERROR                   Tài khoản không hoạt
                                                  động hoặc không được
                                                  phép truy cập

  MSG-AUTH-012            WARNING                 Tài khoản đã đăng nhập
                                                  trên thiết bị khác;
                                                  phiên trước đã bị vô
                                                  hiệu hóa

  MSG-AUTH-013            SUCCESS                 Đăng nhập thành công

  MSG-AUTH-014            WARNING                 Bạn đã vượt quá số lần
                                                  đăng nhập sai cho phép

  MSG-AUTH-015            WARNING                 Phiên đăng nhập đã hết
                                                  hạn. Vui lòng đăng nhập
                                                  lại

  MSG-AUTH-016            SUCCESS                 Thay đổi mật khẩu thành
                                                  công

  MSG-AUTH-017            ERROR                   Không thể thay đổi mật
                                                  khẩu
  -----------------------------------------------------------------------

## 6.3. I18N

  Message ID     Type      Nội dung VI
  -------------- --------- ----------------------------------------------
  MSG-I18N-001   SUCCESS   Ngôn ngữ đã được thay đổi
  MSG-I18N-002   ERROR     Không thể tải nội dung theo ngôn ngữ đã chọn
  MSG-I18N-003   ERROR     Ngôn ngữ không được hỗ trợ

## 6.4. LMS

  -----------------------------------------------------------------------
  Message ID              Type                    Nội dung VI
  ----------------------- ----------------------- -----------------------
  MSG-LMS-001             SUCCESS                 Tạo khóa học thành công

  MSG-LMS-002             SUCCESS                 Cập nhật khóa học thành
                                                  công

  MSG-LMS-003             SUCCESS                 Xóa khóa học thành công

  MSG-LMS-004             VALIDATION              Vui lòng nhập tên khóa
                                                  học

  MSG-LMS-005             ERROR                   Không tìm thấy khóa học

  MSG-LMS-006             WARNING                 Bạn chưa được phép truy
                                                  cập khóa học này

  MSG-LMS-007             ERROR                   Không thể xóa dữ liệu
                                                  do đang có nội dung
                                                  liên quan

  MSG-LMS-008             SUCCESS                 Cập nhật bài học thành
                                                  công

  MSG-LMS-009             ERROR                   Không thể tải nội dung
                                                  bài học
  -----------------------------------------------------------------------

## 6.5. LIB

  Message ID    Type         Nội dung VI
  ------------- ------------ ------------------------------------------
  MSG-LIB-001   SUCCESS      Tải học liệu thành công
  MSG-LIB-002   VALIDATION   Định dạng file không được hỗ trợ
  MSG-LIB-003   ERROR        Tải học liệu thất bại
  MSG-LIB-004   ERROR        Bạn không có quyền truy cập học liệu này
  MSG-LIB-005   WARNING      Liên kết truy cập học liệu đã hết hạn
  MSG-LIB-006   SUCCESS      Cấp quyền truy cập học liệu thành công

## 6.6. CLASS

  -----------------------------------------------------------------------
  Message ID              Type                    Nội dung VI
  ----------------------- ----------------------- -----------------------
  MSG-CLASS-001           SUCCESS                 Tham gia phòng học
                                                  thành công

  MSG-CLASS-002           ERROR                   Không thể kết nối phòng
                                                  học

  MSG-CLASS-003           WARNING                 Trình duyệt chưa được
                                                  cấp quyền microphone

  MSG-CLASS-004           WARNING                 Trình duyệt chưa được
                                                  cấp quyền camera

  MSG-CLASS-005           WARNING                 Bạn chưa được cấp quyền
                                                  thao tác bảng trắng

  MSG-CLASS-006           WARNING                 Bạn đã bị đưa ra khỏi
                                                  phòng học

  MSG-CLASS-007           INFO                    Phòng học đã kết thúc

  MSG-CLASS-008           WARNING                 Kết nối bị gián đoạn
  -----------------------------------------------------------------------

## 6.7. WRITING

  -----------------------------------------------------------------------
  Message ID              Type                    Nội dung VI
  ----------------------- ----------------------- -----------------------
  MSG-WR-001              VALIDATION              Vui lòng nhập nội dung
                                                  bài viết

  MSG-WR-002              CONFIRM                 Bạn có chắc chắn muốn
                                                  nộp bài?

  MSG-WR-003              SUCCESS                 Nộp bài thành công

  MSG-WR-004              INFO                    Bài viết đang được AI
                                                  phân tích

  MSG-WR-005              ERROR                   Không thể phân tích bài
                                                  viết. Vui lòng thử lại
                                                  hoặc liên hệ hỗ trợ

  MSG-WR-006              INFO                    Bài viết đang chờ Admin
                                                  phê duyệt

  MSG-WR-007              SUCCESS                 Kết quả chấm bài đã
                                                  được công bố
  -----------------------------------------------------------------------

## 6.8. SPEAKING

  Message ID   Type      Nội dung VI
  ------------ --------- ---------------------------------------
  MSG-SP-001   WARNING   Vui lòng cấp quyền sử dụng microphone
  MSG-SP-002   INFO      Bắt đầu ghi âm
  MSG-SP-003   SUCCESS   Ghi âm thành công
  MSG-SP-004   ERROR     Không thể lưu bản ghi âm
  MSG-SP-005   SUCCESS   Nộp bài Speaking thành công
  MSG-SP-006   SUCCESS   Kết quả Speaking đã được công bố

## 6.9. QUIZ

  Message ID   Type      Nội dung VI
  ------------ --------- ------------------------------------
  MSG-QZ-001   INFO      Bắt đầu bài kiểm tra
  MSG-QZ-002   WARNING   Bạn chưa hoàn thành tất cả câu hỏi
  MSG-QZ-003   SUCCESS   Nộp bài kiểm tra thành công
  MSG-QZ-004   SUCCESS   Bạn đã đạt yêu cầu
  MSG-QZ-005   WARNING   Bạn chưa đạt yêu cầu
  MSG-QZ-006   WARNING   Thời gian làm bài đã kết thúc
  MSG-QZ-007   ERROR     Không thể tải bài kiểm tra

## 6.10. ATTENDANCE

  Message ID    Type         Nội dung VI
  ------------- ------------ --------------------------------------
  MSG-ATT-001   SUCCESS      Cập nhật điểm danh thành công
  MSG-ATT-002   SUCCESS      Xuất báo cáo thành công
  MSG-ATT-003   INFO         Không có dữ liệu điểm danh
  MSG-ATT-004   VALIDATION   Vui lòng nhập lý do điều chỉnh
  MSG-ATT-005   ERROR        Không thể cập nhật dữ liệu điểm danh

## 6.11. CHAT

  Message ID     Type         Nội dung VI
  -------------- ------------ ---------------------------------------
  MSG-CHAT-001   SUCCESS      Gửi tin nhắn thành công
  MSG-CHAT-002   VALIDATION   Nội dung tin nhắn không được để trống
  MSG-CHAT-003   ERROR        Không thể gửi tin nhắn
  MSG-CHAT-004   WARNING      Mất kết nối. Đang thử kết nối lại
  MSG-CHAT-005   INFO         Có tin nhắn mới

------------------------------------------------------------------------

# 7. Quy tắc nghiệp vụ tổng hợp (Business Rules)

  ------------------------------------------------------------------------
  Rule ID           Phân hệ           Nội dung           Nguồn
  ----------------- ----------------- ------------------ -----------------
  BIZ-AUTH-001      AUTH              Học viên chỉ có    SRS
                                      một phiên đăng     
                                      nhập trên một      
                                      thiết bị tại một   
                                      thời điểm          

  BIZ-AUTH-002      AUTH              Đăng nhập trên     SRS
                                      thiết bị mới làm   
                                      vô hiệu hóa phiên  
                                      cũ                 

  BIZ-AUTH-003      AUTH              Mật khẩu được mã   SRS
                                      hóa bằng bcrypt    

  BIZ-AUTH-004      AUTH              Sử dụng JWT Access SRS
                                      Token và Refresh   
                                      Token; Refresh     
                                      Token lưu bằng     
                                      HTTP-Only Cookie   

  BIZ-AUTH-005      AUTH              Giới hạn số lần    SRS, ngưỡng chưa
                                      đăng nhập sai      quy định

  BIZ-AUTH-006      AUTH              Phân quyền STUDENT SRS
                                      và ADMIN           

  BIZ-I18N-001      I18N              Hỗ trợ VI, EN, JA, SRS
                                      ZH                 

  BIZ-I18N-002      I18N              Ghi nhớ ngôn ngữ   SRS
                                      đã chọn và đồng bộ 
                                      với tài khoản học  
                                      viên               

  BIZ-LMS-001       LMS               Cấu trúc Course →  SRS
                                      Module → Lesson →  
                                      Components         

  BIZ-LMS-002       LMS               Theo dõi tiến độ   SRS
                                      dựa trên bài học   
                                      đã xem, Quiz đã    
                                      vượt qua và        
                                      Speaking/Writing   
                                      đã nộp             

  BIZ-LIB-001       LIB               Học viên xem PDF   SRS
                                      và nghe MP3 trực   
                                      tiếp trên website  

  BIZ-LIB-002       LIB               Không cung cấp tải SRS
                                      trực tiếp file học 
                                      liệu gốc           

  BIZ-LIB-003       LIB               Signed URL có thời SRS
                                      hạn 15 phút        

  BIZ-LIB-004       LIB               Dynamic Watermark  SRS
                                      gồm họ tên, số     
                                      điện thoại, mã học 
                                      viên               

  BIZ-CLASS-001     CLASS             Phòng học có 01    SRS
                                      Admin Host và      
                                      khoảng 6--8 học    
                                      viên               

  BIZ-CLASS-002     CLASS             Đồng bộ bảng trắng SRS
                                      realtime qua       
                                      DataChannel        

  BIZ-CLASS-003     CLASS             Admin quản lý      SRS
                                      quyền bảng trắng   

  BIZ-WR-001        WR                Writing Task 1 và  SRS
                                      Task 2 được AI     
                                      phân tích          

  BIZ-WR-002        WR                AI đánh giá bốn    SRS
                                      tiêu chí IELTS     
                                      Writing            

  BIZ-WR-003        WR                Admin có quyền     SRS
                                      chỉnh sửa và phê   
                                      duyệt kết quả      
                                      trước khi công bố  

  BIZ-SP-001        SP                Speaking được      SRS
                                      Admin trực tiếp    
                                      nghe và chấm,      
                                      không dùng AI tự   
                                      động chấm          

  BIZ-SP-002        SP                Speaking có bốn    SRS
                                      tiêu chí đánh giá  
                                      IELTS              

  BIZ-SP-003        SP                Hỗ trợ nhận xét    SRS
                                      theo timestamp     

  BIZ-QZ-001        QZ                Hỗ trợ Single      SRS
                                      Choice, Multiple   
                                      Choice, Fill in    
                                      the Blanks         

  BIZ-QZ-002        QZ                Quiz có đồng hồ,   SRS
                                      tự động chấm, xác  
                                      định Đạt/Không đạt 

  BIZ-QZ-003        QZ                Tự động mở khóa    SRS
                                      bài học tiếp theo  
                                      theo điều kiện     
                                      Quiz               

  BIZ-ATT-001       ATT               PRESENT: vào trong SRS
                                      15 phút đầu và     
                                      tham gia ít nhất   
                                      80% thời lượng     

  BIZ-ATT-002       ATT               LATE: tham gia sau SRS
                                      15 phút đầu        

  BIZ-ATT-003       ATT               ABSENT: không tham SRS
                                      gia hoặc dưới 30%  
                                      thời lượng         

  BIZ-ATT-004       ATT               Admin được xem     SRS
                                      log, điều chỉnh    
                                      thủ công kèm ghi   
                                      chú và xuất Excel  

  BIZ-DASH-001      DASH              Dashboard học viên SRS
                                      hiển thị khóa học, 
                                      tiến độ, lịch, bài 
                                      tập, kết quả       

  BIZ-DASH-002      DASH              Dashboard Admin    SRS
                                      hiển thị số liệu   
                                      toàn hệ thống      

  BIZ-CHAT-001      CHAT              Nhắn tin realtime  SRS
                                      qua Socket.IO      

  BIZ-CHAT-002      CHAT              Lưu lịch sử hội    SRS
                                      thoại trong cơ sở  
                                      dữ liệu và phân    
                                      quyền dữ liệu      

  BIZ-CLASS-004     CLASS             Bảng trắng 2 chiều SRS
                                      hỗ trợ snapshot    
                                      realtime và phân   
                                      quyền vẽ học viên  

  BIZ-WR-004        WR                Tích hợp model     SRS
                                      Google Gemini AI   
                                      chấm 4 tiêu chí và 
                                      bài mẫu Band 8.5+  

  BIZ-BLOG-001      BLOG              Quản lý bài viết   SRS
                                      Blog, slug SEO,    
                                      ảnh và video       

  BIZ-MEDIA-001     MEDIA             Tích hợp Cloudinary SRS
                                      lưu trữ ảnh avatar,
                                      thumbnail và video 
  ------------------------------------------------------------------------

------------------------------------------------------------------------

# 8. Trạng thái và chuyển trạng thái

Các trạng thái dưới đây là **đề xuất mô hình hóa** dựa trên luồng nghiệp
vụ; SRS nguồn không định nghĩa đầy đủ tên trạng thái kỹ thuật.

## 8.1. Writing Submission -- đề xuất

  -----------------------------------------------------------------------
  Trạng thái              Ý nghĩa                 Chuyển tiếp dự kiến
  ----------------------- ----------------------- -----------------------
  DRAFT                   Bản nháp                SUBMITTED

  SUBMITTED               Đã nộp                  AI_PROCESSING

  AI_PROCESSING           AI đang phân tích       PENDING_REVIEW

  PENDING_REVIEW          Chờ Admin duyệt         APPROVED hoặc trạng
                                                  thái cần xử lý lại

  APPROVED                Đã phê duyệt            PUBLISHED

  PUBLISHED               Đã công bố              Kết thúc luồng hiện tại
  -----------------------------------------------------------------------

Cần BA xác nhận trạng thái lỗi AI, từ chối, yêu cầu nộp lại và cho phép
chỉnh sửa.

## 8.2. Speaking Submission -- đề xuất

  Trạng thái        Ý nghĩa
  ----------------- ------------------
  DRAFT             Bản ghi chưa nộp
  SUBMITTED         Đã nộp
  PENDING_GRADING   Chờ Admin chấm
  GRADING           Đang chấm
  GRADED            Đã chấm
  PUBLISHED         Đã công bố

## 8.3. Course -- đề xuất

  Trạng thái   Ý nghĩa
  ------------ -------------
  DRAFT        Bản nháp
  PUBLISHED    Đã xuất bản
  HIDDEN       Đang ẩn
  ARCHIVED     Lưu trữ

## 8.4. Attendance

Các giá trị nghiệp vụ được SRS xác định: PRESENT, LATE, ABSENT. Không tự
bổ sung trạng thái khác khi chưa được BA xác nhận.

------------------------------------------------------------------------

# 9. Ma trận phân quyền tổng hợp

  Chức năng                                     STUDENT               ADMIN
  -------------------------------- -------------------- -------------------
  Đăng ký/đăng nhập                                  Có           Đăng nhập
  Đổi mật khẩu                                       Có          Chưa mô tả
  Quản lý tài khoản học viên                      Không                  Có
  Chuyển ngôn ngữ                                    Có                  Có
  Xem khóa học                                       Có                  Có
  Đăng ký khóa học                                   Có       Không áp dụng
  Tạo/sửa khóa học                                Không                  Có
  Quản lý Module/Lesson                           Không                  Có
  Xem tiến độ cá nhân                                Có   Có quyền giám sát
  Tải lên học liệu                                Không                  Có
  Xem PDF/Audio theo quyền                           Có                  Có
  Tạo/quản lý phòng học                           Không                  Có
  Tham gia phòng học                                 Có                  Có
  Điều hành phòng học                             Không                  Có
  Thao tác bảng trắng                Khi được cấp quyền    Có quyền quản lý
  Làm Writing                                        Có               Không
  Quản lý đề Writing                              Không                  Có
  Duyệt Writing                                   Không                  Có
  Ghi âm Speaking                                    Có               Không
  Chấm Speaking                                   Không                  Có
  Làm Quiz                                           Có    Có quyền quản lý
  Quản lý Quiz/ngân hàng câu hỏi                  Không                  Có
  Xem kết quả Quiz                                   Có      Có thể quản lý
  Xem điểm danh cá nhân                   Chưa mô tả rõ                  Có
  Điều chỉnh điểm danh                            Không                  Có
  Xuất báo cáo điểm danh                          Không                  Có
  Dashboard cá nhân                                  Có       Không áp dụng
  Dashboard toàn hệ thống                         Không                  Có
  Nhắn tin hỗ trợ                                    Có                  Có

------------------------------------------------------------------------

# 10. Luồng ngoại lệ cần đặc tả

  -----------------------------------------------------------------------
  Mã                Phân hệ           Tình huống        Hành vi cần xác
                                                        định
  ----------------- ----------------- ----------------- -----------------
  EX-AUTH-001       AUTH              Đăng nhập sai     Ngưỡng khóa, thời
                                      nhiều lần         gian khóa, thông
                                                        báo

  EX-AUTH-002       AUTH              Đăng nhập thiết   Vô hiệu hóa phiên
                                      bị mới            cũ và thông báo

  EX-AUTH-003       AUTH              Refresh Token hết Điều hướng đăng
                                      hạn               nhập lại

  EX-I18N-001       I18N              Thiếu bản dịch    Ngôn ngữ fallback

  EX-LMS-001        LMS               Khóa học bị ẩn    Quyền tiếp tục
                                      khi học viên đang truy cập
                                      học               

  EX-LMS-002        LMS               Xóa Module có     Chặn xóa hoặc xử
                                      Lesson            lý dữ liệu con

  EX-LIB-001        LIB               Signed URL hết    Cấp lại URL nếu
                                      hạn               còn quyền

  EX-LIB-002        LIB               File không tải    Retry/thông báo
                                      được              lỗi

  EX-CLASS-001      CLASS             Mất kết nối       Tự kết nối lại
                                      WebRTC            hay yêu cầu tham
                                                        gia lại

  EX-CLASS-002      CLASS             Host rời phòng    Quy tắc kết
                                                        thúc/duy trì
                                                        phòng

  EX-CLASS-003      CLASS             Vượt số người dự  Chặn tham gia hay
                                      kiến              cảnh báo

  EX-WR-001         WR                AI xử lý thất bại Retry, trạng thái
                                                        lỗi, thông báo
                                                        Admin

  EX-WR-002         WR                Học viên đóng     Khôi phục bản
                                      trình duyệt khi   nháp
                                      viết              

  EX-WR-003         WR                Hết giờ chưa nộp  Tự động nộp hay
                                                        cho phép tiếp tục

  EX-SP-001         SP                Không cấp quyền   Hướng dẫn cấp
                                      microphone        quyền

  EX-SP-002         SP                Ghi âm bị gián    Giữ bản ghi hay
                                      đoạn              yêu cầu ghi lại

  EX-QZ-001         QZ                Hết giờ làm Quiz  Tự động nộp hay
                                                        khóa bài

  EX-QZ-002         QZ                Mất mạng khi làm  Lưu đáp án và
                                      Quiz              đồng bộ lại

  EX-ATT-001        ATT               Nhiều lần vào/ra  Cách cộng tổng
                                      phòng             thời gian

  EX-ATT-002        ATT               Webhook gửi       Cơ chế chống ghi
                                      trùng/sai thứ tự  nhận trùng

  EX-CHAT-001       CHAT              Socket mất kết    Kết nối lại và
                                      nối               đồng bộ tin nhắn

  EX-CHAT-002       CHAT              Gửi tin nhắn thất Retry và tránh
                                      bại               gửi trùng
  -----------------------------------------------------------------------

Các hành vi trong cột cuối là câu hỏi cần chốt, không phải quyết định đã
có trong SRS.

------------------------------------------------------------------------

# 11. Danh sách nội dung đã được BA/Khách hàng thông qua và phê duyệt

> **Ghi chú xác nhận:**
> - Đã **loại bỏ các mục 3, 4, 5, 6, 7, 8, 9** (không áp dụng / đã có quy chế mặc định theo SRS).
> - Toàn bộ **23 mục còn lại** đã được **THÔNG QUA & PHÊ DUYỆT CHÍNH THỨC** làm căn cứ triển khai hệ thống.

| STT | STT Gốc | Nội dung đã thông qua | Phân hệ | Mức độ ảnh hưởng | Trạng thái |
| :---: | :---: | :--- | :--- | :---: | :---: |
| 1 | 1 | Trường hồ sơ bắt buộc khi đăng ký | AUTH | Cao | **ĐÃ THÔNG QUA** |
| 2 | 2 | Chính sách mật khẩu và xác minh email | AUTH | Cao | **ĐÃ THÔNG QUA** |
| 3 | 10 | Công thức tính tiến độ khóa học | LMS | Cao | **ĐÃ THÔNG QUA** |
| 4 | 11 | Quy tắc xóa khóa học/chương/bài có dữ liệu liên quan | LMS | Cao | **ĐÃ THÔNG QUA** |
| 5 | 12 | Dung lượng và giới hạn file PDF/MP3 | LIB | Trung bình | **ĐÃ THÔNG QUA** |
| 6 | 13 | Cách gia hạn Signed URL hết hạn khi đang học | LIB | Cao | **ĐÃ THÔNG QUA** |
| 7 | 14 | Quy tắc watermark và hạn chế tải/in học liệu | LIB | Trung bình | **ĐÃ THÔNG QUA** |
| 8 | 15 | Thời gian được phép vào phòng trước giờ học | CLASS | Trung bình | **ĐÃ THÔNG QUA** |
| 9 | 16 | Quy tắc khi Host rời phòng/mất kết nối | CLASS | Cao | **ĐÃ THÔNG QUA** |
| 10 | 17 | Giới hạn thời lượng và số lần ghi âm Speaking | SP | Trung bình | **ĐÃ THÔNG QUA** |
| 11 | 18 | Số từ tối thiểu/tối đa Writing | WR | Cao | **ĐÃ THÔNG QUA** |
| 12 | 19 | Hết giờ Writing tự động nộp bài | WR | Cao | **ĐÃ THÔNG QUA** |
| 13 | 20 | Công thức Overall Band và quy tắc làm tròn (WR & SP) | WR/SP | Cao | **ĐÃ THÔNG QUA** |
| 14 | 21 | Cho phép nộp lại Writing/Speaking | WR/SP | Cao | **ĐÃ THÔNG QUA** |
| 15 | 22 | Số lần làm lại Quiz | QZ | Cao | **ĐÃ THÔNG QUA** |
| 16 | 23 | Cách tính điểm Multiple Choice | QZ | Cao | **ĐÃ THÔNG QUA** |
| 17 | 24 | Quy tắc tự động nộp khi hết giờ Quiz | QZ | Cao | **ĐÃ THÔNG QUA** |
| 18 | 25 | Quy tắc phân loại khoảng chuyên cần 30%–80% | ATT | Cao | **ĐÃ THÔNG QUA** |
| 19 | 26 | Cách tính thời gian khi học viên vào/ra nhiều lần | ATT | Cao | **ĐÃ THÔNG QUA** |
| 20 | 27 | Định nghĩa học viên active và khoảng thống kê | DASH | Trung bình | **ĐÃ THÔNG QUA** |
| 21 | 28 | Quy tắc tạo hội thoại, xóa/lưu trữ tin nhắn | CHAT | Trung bình | **ĐÃ THÔNG QUA** |
| 22 | 29 | Thông báo qua website, email hay kênh khác | Toàn hệ thống | Trung bình | **ĐÃ THÔNG QUA** |
| 23 | 30 | Bản dịch nội dung và thông báo sang EN/JA/ZH | I18N | Trung bình | **ĐÃ THÔNG QUA** |

------------------------------------------------------------------------

# 12. Tiêu chí nghiệm thu theo phân hệ

Các tiêu chí dưới đây diễn giải lại 14 tiêu chí nghiệm thu trong SRS
thành nhóm kiểm thử. Không thay thế tiêu chí nghiệm thu chính thức.

  -----------------------------------------------------------------------
  Mã                      Phân hệ                 Tiêu chí kiểm thử
  ----------------------- ----------------------- -----------------------
  UAT-001                 AUTH                    Đăng ký, đăng nhập,
                                                  Google OAuth và liên
                                                  kết tài khoản Google
                                                  hoạt động đúng

  UAT-002                 AUTH                    Single Concurrent
                                                  Session hoạt động đúng
                                                  với học viên

  UAT-003                 I18N                    Chuyển đổi VI/EN/JA/ZH
                                                  không gây lỗi hiển thị

  UAT-004                 LMS                     Admin tạo và quản lý
                                                  Course, Module, Lesson,
                                                  học liệu

  UAT-005                 LIB                     Học viên truy cập
                                                  PDF/Audio đúng quyền

  UAT-006                 LIB                     Dynamic Watermark hiển
                                                  thị thông tin định danh
                                                  học viên

  UAT-007                 CLASS                   Admin và học viên tương
                                                  tác ổn định qua âm
                                                  thanh, hình ảnh và bảng
                                                  trắng

  UAT-008                 WR                      AI phân tích Writing
                                                  theo bốn tiêu chí và
                                                  đưa ra nhận xét/gợi ý

  UAT-009                 SP                      Học viên ghi âm, gửi
                                                  bài và nhận phản hồi
                                                  theo timestamp

  UAT-010                 QZ                      Quiz tự động chấm và
                                                  xác định Đạt/Không đạt
                                                  chính xác

  UAT-011                 ATT                     Webhook LiveKit ghi
                                                  nhận thời gian và phân
                                                  loại chuyên cần

  UAT-012                 ATT                     Admin xem và xuất báo
                                                  cáo Excel

  UAT-013                 DASH                    Dashboard hiển thị đúng
                                                  dữ liệu theo quyền

  UAT-014                 CHAT                    Nhắn tin realtime ổn
                                                  định, bảo mật và lưu
                                                  lịch sử
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 13. Checklist hoàn thiện trước khi chuyển Developer

## 13.1. BA/PO

-   [ ] Xác nhận danh sách màn hình và vai trò.
-   [ ] Xác nhận toàn bộ trường dữ liệu và trường bắt buộc.
-   [ ] Chốt giới hạn độ dài, dung lượng, thời gian và thang điểm.
-   [ ] Chốt Business Rules và các trường hợp biên.
-   [ ] Chốt trạng thái và chuyển trạng thái.
-   [ ] Chốt Message Catalog và nội dung đa ngôn ngữ.
-   [ ] Chốt quyền theo từng hành động.
-   [ ] Chốt tiêu chí nghiệm thu.

## 13.2. UI/UX

-   [ ] Có wireframe/mockup cho từng màn hình.
-   [ ] Có trạng thái loading, empty, error, success.
-   [ ] Có trạng thái disabled/read-only.
-   [ ] Có hiển thị lỗi validation.
-   [ ] Có thiết kế responsive.
-   [ ] Có phương án hiển thị VI/EN/JA/ZH.

## 13.3. Backend

-   [x] Mapping trường giao diện với API/DTO/Database (Đã hoàn thiện đặc tả chi tiết toàn bộ các Endpoints tại [docs/API_DOCUMENTATION.md](file:///D:/Project/englishweb/docs/API_DOCUMENTATION.md)).
-   [ ] Validation phía server.
-   [ ] Kiểm tra quyền và trạng thái.
-   [ ] Chuẩn hóa mã lỗi/message code.
-   [ ] Định nghĩa transaction và xử lý đồng thời.
-   [ ] Định nghĩa log/audit cho thao tác nhạy cảm.
-   [ ] Định nghĩa webhook/realtime và xử lý gửi lặp.

## 13.4. Frontend

-   [ ] Mapping field với API.
-   [ ] Kiểm tra dữ liệu phía client.
-   [ ] Hiển thị loading/empty/error.
-   [ ] Chặn thao tác theo quyền và trạng thái.
-   [ ] Đồng bộ dữ liệu sau thao tác.
-   [ ] Hỗ trợ đa ngôn ngữ.
-   [ ] Responsive và tương thích trình duyệt.

## 13.5. QA

-   [ ] Test luồng thành công.
-   [ ] Test validation từng trường.
-   [ ] Test phân quyền.
-   [ ] Test trạng thái và chuyển trạng thái.
-   [ ] Test trường hợp ngoại lệ.
-   [ ] Test realtime, mất mạng và khôi phục.
-   [ ] Test dữ liệu biên.
-   [ ] Đối chiếu 14 tiêu chí nghiệm thu.

------------------------------------------------------------------------

# 14. Tham chiếu cấu trúc dữ liệu trong SRS nguồn

Các Model/Bảng được nêu trong tài liệu nguồn:

  -----------------------------------------------------------------------
  Model/Bảng                          Mô tả
  ----------------------------------- -----------------------------------
  User                                Tài khoản, vai trò và trạng thái
                                      người dùng

  RefreshToken                        Quản lý Refresh Token và Single
                                      Session

  GoogleAccount                       Liên kết Google OAuth

  Course                              Khóa học, danh mục, cấp độ, giảng
                                      viên

  Module                              Chương học

  Lesson                              Bài học

  Material                            Học liệu số

  Enrollment                          Đăng ký và tiến độ khóa học

  WritingPrompt                       Đề IELTS Writing

  WritingSubmission                   Bài Writing nộp, bản nháp, kết quả
                                      AI và duyệt

  SpeakingPrompt                      Đề Speaking và audio mẫu

  SpeakingSubmission                  File ghi âm, điểm bốn tiêu chí và
                                      timestamp feedback

  Quiz                                Bài kiểm tra, thời gian và điểm sàn

  QuizQuestion                        Câu hỏi

  QuizOption                          Phương án và đáp án đúng

  QuizSubmission                      Kết quả làm bài, điểm và trạng thái

  Room                                Phòng học LiveKit

  AttendanceRecord                    Log vào/ra, tổng phút và trạng thái
                                      chuyên cần

  Conversation                        Hội thoại hỗ trợ

  Message                             Tin nhắn, người gửi/nhận, thời gian
                                      và trạng thái đã đọc
  -----------------------------------------------------------------------

**Lưu ý:** Bảng trên là danh sách Model ở mức tổng quan, không phải
database schema đầy đủ. Không suy ra tên cột, kiểu cột, khóa ngoại hoặc
index khi chưa có schema chính thức.

------------------------------------------------------------------------

# 15. Kết luận và nguyên tắc sử dụng tài liệu

Tài liệu này chuyển phạm vi chức năng Teacher Dong Academy thành bộ
khung đặc tả chi tiết theo màn hình, trường dữ liệu, hành động,
Validation, Message, Business Rules, trạng thái, phân quyền, ngoại lệ và
nghiệm thu.

Trước khi phát triển chính thức: 1. BA/khách hàng xác nhận các nội dung
được đánh dấu **\[ĐỀ XUẤT -- CẦN BA XÁC NHẬN\]** hoặc **\[CHƯA QUY
ĐỊNH\]**. 2. UI/UX đối chiếu từng màn hình với mockup. 3. Backend thống
nhất mapping API/DTO/database. 4. Frontend triển khai đúng hành vi và
trạng thái. 5. QA dùng mã màn hình, field, validation, message và rule
để xây dựng test case.

**Nguyên tắc:** Không tự coi các đề xuất trong tài liệu này là yêu cầu
đã được khách hàng phê duyệt. Mọi giới hạn, công thức, trạng thái và
hành vi chưa có trong SRS nguồn phải được xác nhận trước khi triển khai.

------------------------------------------------------------------------

# 16. Danh mục RESTful Endpoints & WebSocket APIs của Backend

Toàn bộ hệ thống Backend NestJS của Teacher Dong Academy đã được chuẩn hóa RESTful và tài liệu hóa chi tiết tại file:  
👉 **[docs/API_DOCUMENTATION.md](file:///D:/Project/englishweb/docs/API_DOCUMENTATION.md)**

### Tóm tắt kiến trúc API & Phân hệ:
- **Global Prefix**: `/api`
- **Swagger OpenAPI Docs**: `http://localhost:3001/api/docs`
- **Mô hình bảo mật**: Strict 2-Role RBAC (`STUDENT` & `ADMIN`), Single Concurrent Session cho học viên, Presigned Signed URLs 15m với Dynamic Watermark cho học liệu số.
- **Envelope Response chuẩn**: `StandardSuccessResponse<T>` và `StandardErrorResponse`.

### Ma trận 14 phân hệ Endpoints chính:
1. **AUTH & SESSIONS (`/api/auth`)**: 13 endpoints (Đăng ký, Đăng nhập Single Session, Google OAuth 2.0, Refresh token, Thu hồi phiên, Đổi mật khẩu, Ngôn ngữ giao diện).
2. **USERS MANAGEMENT (`/api/users`)**: 5 endpoints ADMIN (Quản lý hồ sơ học viên, Khóa/Mở tài khoản, Cấp lại mật khẩu, Upload avatar Cloudinary).
3. **COURSES CATALOG (`/api/courses`)**: 9 endpoints (5 trụ cột danh mục đào tạo, Ghi danh học viên, Quản trị khóa học, Thumbnail Cloudinary).
4. **CURRICULUM & LESSONS (`/api/lessons`)**: 11 endpoints (Quản lý Chương học Module, Bài học Lesson, Kéo thả Reorder, Đánh dấu hoàn thành tính tiến độ %, Upload Video Cloudinary).
5. **SECURED DIGITAL LIBRARY (`/api/materials`)**: 7 endpoints (Kho tài liệu số PDF/MP3, Cấp Signed URL 15 phút, Inline Stream DRM chống tải lậu, Dynamic Watermark payload).
6. **QUIZ ENGINE & DIAGNOSTICS (`/api/quizzes`)**: 11 endpoints (Đề thi 4 kỹ năng IELTS, Chấm điểm tức thì, Sàn đạt >= 80%, Báo cáo AI chẩn đoán điểm yếu dạng bài của từng học viên và toàn học viện).
7. **AI IELTS WRITING STUDIO (`/api/writing`)**: 10 endpoints (Đề Task 1 & 2, Đếm từ thời gian thực, AI chấm 4 tiêu chí Cambridge, Sinh bài mẫu Band 8.5+, Admin override & phê duyệt).
8. **IELTS SPEAKING STUDIO (`/api/speaking`)**: 10 endpoints (Đề Speaking Part 1-3, Nộp audio Web Audio API sóng âm, Audio Player +/- 5s, Giáo viên chấm 4 tiêu chí + Timestamp Comments).
9. **LIVEKIT WEBRTC CLASSROOM (`/api/livekit`)**: 10 endpoints + Whiteboard Gateway `/whiteboard` (Cấp WebRTC Token Host/Student 1+8, Tắt mic/cam từ xa, LiveKit Webhook, Bảng trắng 2 chiều realtime).
10. **AUTOMATED ATTENDANCE (`/api/attendance`)**: 6 endpoints (Tự động ghi nhận giờ vào/ra và số phút từ Webhook, Phân loại PRESENT/LATE/ABSENT, Điều chỉnh thủ công, Xuất báo cáo Excel `.xlsx`).
11. **REALTIME CHAT & MESSAGING (`/api/chat`)**: 4 endpoints + Chat Gateway `/chat` (Nhắn tin thời gian thực giữa Học viên và Giáo viên qua Socket.IO, HTTP fallback, Đánh dấu đã đọc).
12. **DASHBOARD & ANALYTICS (`/api/dashboard`)**: 2 endpoints (Thống kê học tập học viên & Báo cáo tổng quan học viện cho Admin).
13. **BLOGS & CONTENT (`/api/blogs`)**: 7 endpoints (Quản trị bài viết chia sẻ, Đính kèm ảnh bìa & video Cloudinary, Tự động tăng lượt xem).
14. **MEDIA STORAGE (`/api/media`)**: 3 endpoints (Upload hình ảnh, video chung lên Cloudinary CDN và dọn dẹp asset).

