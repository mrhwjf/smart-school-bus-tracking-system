import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Button, 
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const EditAccount = ({ onBack, driverData, busData }) => {
    
    // Khởi tạo state với dữ liệu ban đầu
    const [formData, setFormData] = useState({
        name: driverData?.name || "N/A",
        driverId: driverData?.userId || "N/A",
        phone: driverData?.phoneNumber || "N/A",
        email: driverData?.email || "N/A",
        avatar: driverData?.avatar || "/default-avatar.png",
        licenseNumber: driverData?.driverInfo?.licenseNumber || "N/A",
        licensePlate: busData?.plateNumber || "N/A",
    });
    
    // State để theo dõi quá trình gửi (ví dụ: hiển thị loading)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Hàm xử lý sự kiện thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Hàm xử lý khi nhấn nút Gửi (Submit)
    const handleSubmit = () => {
        setIsSubmitting(true);
        
        // TODO: Triển khai logic gọi API để cập nhật thông tin người dùng
        console.log("Dữ liệu gửi đi:", {
            userId: formData.driverId,
            name: formData.name,
            phoneNumber: formData.phone,
            email: formData.email,
        });

        // Mô phỏng quá trình gọi API (ví dụ: 2 giây)
        setTimeout(() => {
            setIsSubmitting(false);
            alert('Thông tin đã được gửi thành công (mô phỏng).');
            // Sau khi lưu thành công, bạn có thể gọi onBack()
            // onBack(); 
        }, 2000);
    };

    // Định nghĩa các trường và quyền chỉnh sửa
    const fields = [
        { label: "Họ và tên", name: "name", editable: true },
        { label: "Số điện thoại", name: "phone", editable: true },
        { label: "Email", name: "email", editable: true },
        { label: "Số giấy phép lái xe", name: "licenseNumber", editable: false },
        { label: "Biển số xe", name: "licensePlate", editable: false },
    ];

    
    return (
        <Box >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#2962ff",
                    color: "#fff",
                    p: 1.2,
                    mb: 2,
                    borderRadius: 1,
                }}
            >
                <IconButton onClick={onBack} sx={{ color: "white" }}>
                    {" "}
                    <ArrowBackIcon />{" "}
                </IconButton>
                <Typography variant="h6" sx={{ fontWeight: 600, ml: 1 }}>
                    Chỉnh sửa thông tin{" "}
                </Typography>{" "}
            </Box>

            {/* Avatar */}
            <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                    src={formData.avatar}
                    sx={{
                        width: 80,
                        height: 80,
                        margin: "auto",
                        mb: 1,
                        border: "2px solid #1976d2",
                    }}
                />
                <Typography variant="body2" color="textSecondary">
                    ID: {formData.driverId}
                </Typography>
            </Box>

            {/* Form Fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {fields.map(({ label, name, editable }) => (
                    <TextField
                        key={name}
                        label={label}
                        name={name}
                        value={formData[name]}
                        // Chỉ gán onChange nếu trường có thể chỉnh sửa
                        onChange={editable ? handleChange : undefined} 
                        fullWidth
                        // Đặt readOnly: true cho các trường không chỉnh sửa được
                        InputProps={{ readOnly: !editable }} 
                        // Thêm màu nền xám nhẹ để phân biệt trường chỉ đọc
                        sx={!editable ? { 
                            "& .MuiInputBase-input.Mui-disabled": {
                                WebkitTextFillColor: "#000", // Giữ màu chữ đen
                            },
                            "& .MuiOutlinedInput-root.Mui-disabled": {
                                backgroundColor: '#f5f5f5', // Nền xám nhạt
                            }
                        } : {}}
                    />
                ))}
            </Box>

            {/* Gửi Button */}
            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSubmit}
                    disabled={isSubmitting} // Vô hiệu hóa nút khi đang gửi
                    fullWidth 
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi'}
                </Button>
            </Box>
            
        </Box>
    );
};

export default EditAccount;