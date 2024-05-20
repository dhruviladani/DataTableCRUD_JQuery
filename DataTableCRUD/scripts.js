$(document).ready(function () {
    var dataTable = $("#dataTable");

    function populateDataTable(data) {
        var headers = Object.keys(data[0]);
        var headerRow = "<thead><tr>";
        headers.forEach(function (header) {
            headerRow += "<th>" + header + "</th>";
        });
        headerRow += "<th>Actions</th>";
        headerRow += "</tr></thead>";
        dataTable.html(headerRow);
        var tbody = $("<tbody></tbody>");
        data.forEach(function (rowData) {
            var row = $("<tr></tr>");
            headers.forEach(function (header) {
                row.append("<td>" + rowData[header] + "</td>");
            });
            var actionColumn = $("<td></td>");
            var updateBtn = $("<button class='btn btn-primary updateBtn'>Update</button>");
            var deleteBtn = $("<button class='btn btn-danger deleteBtn'>Delete</button>");
            actionColumn.append(updateBtn);
            actionColumn.append(deleteBtn);
            row.append(actionColumn);
            tbody.append(row);
        });
        dataTable.append(tbody);

        $('#dataTable').DataTable();

        $(document).on("click", ".updateBtn", function () {
            var rowIndex = $(this).closest("tr").index();
            var rowData = data[rowIndex];
            openUpdateModal(rowData);
        });

        $(document).on("click", ".deleteBtn", function () {
            var rowIndex = $(this).closest("tr").index();
            var rowData = data[rowIndex];
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
                        method: "DELETE",
                        data: JSON.stringify({ registration_main_id: rowData.registration_main_id }),
                        success: function (response) {
                            if (response.status) {
                                dataTable.find("tr").eq(rowIndex + 1).remove();
                                Swal.fire("Deleted!", "The record has been deleted.", "success");
                            } else {
                                Swal.fire("Error!", "Failed to delete the record.", "error");
                            }
                        },
                        error: function () {
                            Swal.fire("Error!", "Failed to delete the record.", "error");
                        }
                    });
                }
            });
        });
    }

    function fetchDataAndPopulateDataTable() {
        $.ajax({
            url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
            method: "GET",
            success: function (response) {
                if (response.status && response.response) {
                    var data = response.response;
                    populateDataTable(data);
                } else {
                    alert("Error: " + response.message);
                }
            },
            error: function () {
                alert("Error fetching data from the API.");
            }
        });
    }

    fetchDataAndPopulateDataTable();

    function openUpdateModal(rowData) {
        var modalContent = $("#modalFormContent").html();
        Swal.fire({
            title: "Update Record",
            html: modalContent,
            showCancelButton: true,
            confirmButtonText: "Save Changes",
            cancelButtonText: "Cancel",
            showLoaderOnConfirm: true,
            didOpen: function () {
                var phoneInput = Swal.getPopup().querySelector("#phoneNumber");
                var iti = intlTelInput(phoneInput, {
                    initialCountry: "auto",
                    geoIpLookup: function (callback) {
                        $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                            var countryCode = (resp && resp.country) ? resp.country : "us";
                            callback(countryCode);
                        });
                    },
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
                });

                Swal.getPopup().querySelector("#registrationMainId").value = rowData.registration_main_id;
                Swal.getPopup().querySelector("#userCode").value = rowData.user_code;
                Swal.getPopup().querySelector("#firstName").value = rowData.first_name;
                Swal.getPopup().querySelector("#middleName").value = rowData.middle_name;
                Swal.getPopup().querySelector("#lastName").value = rowData.last_name;
                phoneInput.value = rowData.phone_number;
                iti.setNumber(rowData.phone_number);
                Swal.getPopup().querySelector("#email").value = rowData.email;
                Swal.getPopup().querySelector("#createdTime").value = rowData.created_time;

                $('#phoneNumberCollapse').collapse('show'); // Show the collapsible field
            },
            preConfirm: function () {
                var phoneInput = Swal.getPopup().querySelector("#phoneNumber");
                var iti = intlTelInputGlobals.getInstance(phoneInput);

                var updatedData = {
                    registration_main_id: rowData.registration_main_id,
                    user_code: Swal.getPopup().querySelector("#userCode").value,
                    first_name: Swal.getPopup().querySelector("#firstName").value,
                    middle_name: Swal.getPopup().querySelector("#middleName").value,
                    last_name: Swal.getPopup().querySelector("#lastName").value,
                    phone_number: iti.getNumber(),
                    phone_country_code: iti.getSelectedCountryData().dialCode,
                    email: Swal.getPopup().querySelector("#email").value,
                    created_time: Swal.getPopup().querySelector("#createdTime").value
                };

                return $.ajax({
                    url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
                    method: "PUT",
                    data: JSON.stringify(updatedData),
                    success: function (response) {
                        if (response.status) {
                            Swal.fire("Record Updated!", "", "success").then((result) => {
                                if (result.isConfirmed) {
                                    location.reload();
                                }
                            });
                        } else {
                            Swal.showValidationMessage("Failed to update the record.");
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("AJAX Error:", error);
                        Swal.showValidationMessage("Failed to update the record.");
                    }
                });
            },
            allowOutsideClick: false
        });
    }

    function openAddModal() {
        var modalContent = $('#modalFormContent').html();
        Swal.fire({
            title: "Add New Record",
            html: modalContent,
            showCancelButton: true,
            confirmButtonText: "Save",
            cancelButtonText: "Cancel",
            showLoaderOnConfirm: true,
            didOpen: function () {
                var phoneInput = Swal.getPopup().querySelector("#phoneNumber");
                var iti = intlTelInput(phoneInput, {
                    initialCountry: "auto",
                    geoIpLookup: function (callback) {
                        $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                            var countryCode = (resp && resp.country) ? resp.country : "us";
                            callback(countryCode);
                        });
                    },
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
                });

                $('#phoneNumberCollapse').collapse('show'); // Show the collapsible field
            },
            preConfirm: function () {
                var phoneInput = Swal.getPopup().querySelector("#phoneNumber");
                var iti = intlTelInputGlobals.getInstance(phoneInput);
                var user_code = Swal.getPopup().querySelector("#userCode").value;
                var first_name = Swal.getPopup().querySelector("#firstName").value;
                var middle_name = Swal.getPopup().querySelector("#middleName").value;
                var last_name = Swal.getPopup().querySelector("#lastName").value;
                var phone_number = iti.getNumber();
                var phone_country_code = iti.getSelectedCountryData().dialCode;
                var email = Swal.getPopup().querySelector("#email").value;
                var created_time = Swal.getPopup().querySelector("#createdTime").value;

                if (!user_code || !first_name || !last_name || !email || !created_time) {
                    Swal.showValidationMessage("Please fill in all required fields.");
                    return false;
                }

                var newData = {
                    user_code: user_code,
                    first_name: first_name,
                    middle_name: middle_name,
                    last_name: last_name,
                    phone_number: phone_number,
                    phone_country_code: phone_country_code,
                    email: email,
                    created_time: created_time
                };

                var urlEncodedData = $.param(newData);

                return $.ajax({
                    url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
                    method: "POST",
                    data: urlEncodedData,
                    success: function (response) {
                        if (response.status) {
                            var newRow = [
                                response.response.registration_main_id,
                                newData.user_code,
                                newData.first_name,
                                newData.middle_name,
                                newData.last_name,
                                newData.phone_number,
                                newData.phone_country_code,
                                newData.email,
                                newData.created_time,
                                "<button class='btn btn-primary updateBtn'>Update</button><button class='btn btn-danger deleteBtn'>Delete</button>"
                            ];
                            var dataTable = $('#dataTable').DataTable();
                            dataTable.row.add(newRow).draw();

                            Swal.fire("Record Added!", "", "success");
                        } else {
                            Swal.showValidationMessage(response.message || "Failed to add the record.");
                        }
                    },
                    error: function (xhr, status, error) {
                        Swal.showValidationMessage("Failed to add the record. Error: " + error);
                    }
                });
            },
            allowOutsideClick: false
        });
    }

    var addButton = $('<button class="btn btn-success mt-3">Add New Record</button>');
    addButton.click(function () {
        openAddModal();
    });
    $('.container').prepend(addButton);
});
