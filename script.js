let username = null, organizations = [], working_leads = [], priority_leads = [], transfered_leads = [], deals = [];
let organization_dataTable = null, workingLeads_dataTable = null, priorityLeads_dataTable = null, transferedLeads_dataTable= null, deals_dateTable = null;

$(document).ready(function() {
  const urlParams = new URLSearchParams(window.location.search);
  username = urlParams.get('username');
  
  if (username) {
    sessionStorage.setItem('username', username);
    $("#profile-name").text(username);
    console.log('Username:', username);
  }

  $("#lead-create-date").flatpickr();
  $("#lead-create-date").val(new Date().toISOString().split('T')[0]);
  $('.select2-hidden-accessible').select2();
});

var CRMDataTable = function (tableId, columnDefs) {
    var dt;
    
    var initDatatable = function () {
        dt = $(tableId).DataTable({
            searchDelay: 500,
            processing: true,
            serverSide: false,
            scrollX: true,
            "sDom": "t",
            "sScrollY":"405px",
            "bScrollCollapse":true ,
            order: [[0, 'desc']],
            "sDom": "ltipr",
            stateSave: true,
            select: {
                style: 'multi',
                selector: 'td:first-child input[type="checkbox"]',
                className: 'row-selected'
            },
            columns: columnDefs,
            createdRow: function (row, data, dataIndex) {
                // Customize row if needed
                $(row).attr('data-bs-toggle', 'modal');
                $(row).attr('data-bs-target', '#kt_modal');

            }
        });
    }

    var fetchData = function () {
        console.log('Fetching Data')
        $.ajax({
            url: `https://script.google.com/macros/s/AKfycbydiAa9DmqrZpfWBH6gDau8JkmJ3h5hxtyIjbVkJdpzyT4XAhuZYib8Zae-PhzqdW6V8g/exec?username=${username}&datatype=Working Leads`,
            success: function (response) {
                console.log('Request Completed Sucessfully')
                var data = response.data;
                dt.rows.add(data).draw();
                return data
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error("Request failed with status:", textStatus);
                console.error("Error thrown:", errorThrown);
                alert('Error loading data.');
            }
        });
    };

    var handleSearchDatatable = function () {
        const filterSearch = document.querySelector('[data-table-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            dt.search(e.target.value).draw();
        });
    }

    var openEditModal = function (table, rowData) {
        // Create or use existing modal structure
        console.log(rowData)
        var modalHtml = `
            <div class="modal fade" id="kt_modal" tabindex="-1" aria-modal="true" role="dialog">
                <div class="modal-dialog modal-dialog-centered mw-700px">
                    <div class="modal-content rounded">
                        <div class="modal-header pb-0 border-0 justify-content-end">
                            <button type="button" class="btn btn-sm btn-icon btn-active-color-primary close" data-bs-dismiss="modal" aria-label="Close">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="black"></rect>
                                        <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="black"></rect>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div class="modal-body scroll-y px-10 px-lg-15 pt-0 pb-15">
                            <form id="modal_form" class="form fv-plugins-bootstrap5 fv-plugins-framework" action="#">
                                <div class="mb-13 text-center">
                                    
                                </div>
        
                                <div class="row g-9 mb-8">
                                    <div class="col-md-6 fv-row">
                                        <label class="fs-6 fw-bold mb-2">Lead Create Date</label>
                                        <div class="position-relative d-flex align-items-center">
                                            <span class="svg-icon svg-icon-2 position-absolute mx-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path opacity="0.3" d="M21 22H3C2.4 22 2 21.6 2 21V5C2 4.4 2.4 4 3 4H21C21.6 4 22 4.4 22 5V21C22 21.6 21.6 22 21 22Z" fill="black"></path>
                                                    <path d="M6 6C5.4 6 5 5.6 5 5V3C5 2.4 5.4 2 6 2C6.6 2 7 2.4 7 3V5C7 5.6 6.6 6 6 6ZM11 5V3C11 2.4 10.6 2 10 2C9.4 2 9 2.4 9 3V5C9 5.6 9.4 6 10 6C10.6 6 11 5.6 11 5ZM15 5V3C15 2.4 14.6 2 14 2C13.4 2 13 2.4 13 3V5C13 5.6 13.4 6 14 6C14.6 6 15 5.6 15 5ZM19 5V3C19 2.4 18.6 2 18 2C17.4 2 17 2.4 17 3V5C17 5.6 17.4 6 18 6C18.6 6 19 5.6 19 5Z" fill="black"></path>
                                                    <path d="M8.8 13.1C9.2 13.1 9.5 13 9.7 12.8C9.9 12.6 10.1 12.3 10.1 11.9C10.1 11.6 10 11.3 9.8 11.1C9.6 10.9 9.3 10.8 9 10.8C8.8 10.8 8.59999 10.8 8.39999 10.9C8.19999 11 8.1 11.1 8 11.2C7.9 11.3 7.8 11.4 7.7 11.6C7.6 11.8 7.5 11.9 7.5 12.1C7.5 12.2 7.4 12.2 7.3 12.3C7.2 12.4 7.09999 12.4 6.89999 12.4C6.69999 12.4 6.6 12.3 6.5 12.2C6.4 12.1 6.3 11.9 6.3 11.7C6.3 11.5 6.4 11.3 6.5 11.1C6.6 10.9 6.8 10.7 7 10.5C7.2 10.3 7.49999 10.1 7.89999 10C8.29999 9.90003 8.60001 9.80003 9.10001 9.80003C9.50001 9.80003 9.80001 9.90003 10.1 10C10.4 10.1 10.7 10.3 10.9 10.4C11.1 10.5 11.3 10.8 11.4 11.1C11.5 11.4 11.6 11.6 11.6 11.9C11.6 12.3 11.5 12.6 11.3 12.9C11.1 13.2 10.9 13.5 10.6 13.7C10.9 13.9 11.2 14.1 11.4 14.3C11.6 14.5 11.8 14.7 11.9 15C12 15.3 12.1 15.5 12.1 15.8C12.1 16.2 12 16.5 11.9 16.8C11.8 17.1 11.5 17.4 11.3 17.7C11.1 18 10.7 18.2 10.3 18.3C9.9 18.4 9.5 18.5 9 18.5C8.5 18.5 8.1 18.4 7.7 18.2C7.3 18 7 17.8 6.8 17.6C6.6 17.4 6.4 17.1 6.3 16.8C6.2 16.5 6.10001 16.3 6.10001 16.1C6.10001 15.9 6.2 15.7 6.3 15.6C6.4 15.5 6.6 15.4 6.8 15.4C6.9 15.4 7.00001 15.4 7.10001 15.5C7.20001 15.6 7.3 15.6 7.3 15.7C7.5 16.2 7.7 16.6 8 16.9C8.3 17.2 8.6 17.3 9 17.3C9.2 17.3 9.5 17.2 9.7 17.1C9.9 17 10.1 16.8 10.3 16.6C10.5 16.4 10.5 16.1 10.5 15.8C10.5 15.3 10.4 15 10.1 14.7C9.80001 14.4 9.50001 14.3 9.10001 14.3C9.00001 14.3 8.9 14.3 8.7 14.3C8.5 14.3 8.39999 14.3 8.39999 14.3C8.19999 14.3 7.99999 14.2 7.89999 14.1C7.79999 14 7.7 13.8 7.7 13.7C7.7 13.5 7.79999 13.4 7.89999 13.2C7.99999 13 8.2 13 8.5 13H8.8V13.1ZM15.3 17.5V12.2C14.3 13 13.6 13.3 13.3 13.3C13.1 13.3 13 13.2 12.9 13.1C12.8 13 12.7 12.8 12.7 12.6C12.7 12.4 12.8 12.3 12.9 12.2C13 12.1 13.2 12 13.6 11.8C14.1 11.6 14.5 11.3 14.7 11.1C14.9 10.9 15.2 10.6 15.5 10.3C15.8 10 15.9 9.80003 15.9 9.70003C15.9 9.60003 16.1 9.60004 16.3 9.60004C16.5 9.60004 16.7 9.70003 16.8 9.80003C16.9 9.90003 17 10.2 17 10.5V17.2C17 18 16.7 18.4 16.2 18.4C16 18.4 15.8 18.3 15.6 18.2C15.4 18.1 15.3 17.8 15.3 17.5Z" fill="black"></path>
                                                </svg>
                                            </span>
                                            <input id="create-date" class="form-control form-control-solid ps-12 flatpickr-input" name="create_date" type="text" readonly="readonly" value="${rowData['Date Added']}" disabled>
                                        </div>
                                    </div>
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                            <span class="required">Organization Name</span>
                                        </label>
                                        <input type="text" class="form-control form-control-solid" placeholder="Organization Name" name="organization" value="${rowData['Organization']}">
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div> 
                                </div>
        
                                <div class="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
                                    <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                        <span class="required">Organization Linkedin</span>
                                    </label>
                                    <input type="url" class="form-control form-control-solid" placeholder="Organization Linkedin" name="org_linkedin" value="${rowData['Organization Linkedin']}">
                                    <div class="fv-plugins-message-container invalid-feedback"></div>
                                </div>
        
                                <div class="row g-9 mb-8">
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                            <span class="required">Lead Name</span>
                                        </label>
                                        <input type="text" class="form-control form-control-solid" placeholder="Lead Name" name="lead_name" value="${rowData['POC']}">
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                            <span class="required">Designation</span>
                                        </label>
                                        <input type="text" class="form-control form-control-solid" placeholder="Designation" name="designation" value="${rowData['Designation']}">
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                </div>
        
                                <div class="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
                                    <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                        <span class="required">Linkedin Profile</span>
                                    </label>
                                    <input type="url" class="form-control form-control-solid" placeholder="Enter Linkein Profile" name="linkedin_profile" value="${rowData['Linkedin']}">
                                    <div class="fv-plugins-message-container invalid-feedback"></div>
                                </div>
        
                                <div class="d-flex flex-column mb-8 fv-row fv-plugins-icon-container">
                                    <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                        <span class="required">Email Address</span>
                                    </label>
                                    <input type="email" class="form-control form-control-solid" placeholder="Enter Email Address" name="email_address" value="${rowData['Email ID']}">
                                    <div class="fv-plugins-message-container invalid-feedback"></div>
                                </div>
        
                                <div class="row g-9 mb-8">
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                            <span class="required">Contact Number</span>
                                        </label>
                                        <input type="tel" class="form-control form-control-solid" placeholder="Contact Number" name="contact_numbrer" value="${rowData['Contact No']}">
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                    
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="d-flex align-items-center fs-6 fw-bold mb-2">
                                            <span class="required">Lead Source</span>
                                        </label>
                                        <input type="text" class="form-control form-control-solid" placeholder="Enter Lead Source" name="lead_source" value="${rowData['Source']}">
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                </div>
        
                                <div class="row g-9 mb-8">
                                    <div class="col-md-6 fv-row fv-plugins-icon-container">
                                        <label class="fs-6 fw-bold mb-2">Lead Status</label>
                                        <select class="form-select form-select-solid" data-control="select2" data-hide-search="true" data-close-on-select="false" data-placeholder="Select Status" name="lead_status" data-dropdown-parent="#kt_modal_new_lead" data-allow-clear="true">
                                            <option value="Active" ${rowData['Lead Status'] === 'Active' ? 'selected' : ''}>Active</option>
                                            <option value="Passive" ${rowData['Lead Status'] === 'Passive' ? 'selected' : ''}>Passive</option>
                                            <option value="Contact Later" ${rowData['Lead Status'] === 'Contact Later' ? 'selected' : ''}>Contact Later</option>
                                            <option value="Dormant" ${rowData['Lead Status'] === 'Dormant' ? 'selected' : ''}>Dormant</option>
                                            <option value="Rejected" ${rowData['Lead Status'] === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                        </select>
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                    <div class="col-md-6 d-flex flex-column fv-row fv-plugins-icon-container">
                                        <label class="fs-6 fw-bold mb-2">Lead Priority</label>
                                        <select class="form-select form-select-solid" data-control="select2" data-hide-search="true" data-close-on-select="false" data-placeholder="Select Priority" name="lead_status" data-dropdown-parent="#kt_modal_new_lead" data-allow-clear="true">
                                            <option value="P1" ${rowData['Priority'] === '' ? 'selected' : ''}></option>
                                            <option value="P1" ${rowData['Priority'] === 'Active' ? 'selected' : ''}>P1</option>
                                            <option value="P2" ${rowData['Priority'] === 'Passive' ? 'selected' : ''}>P2</option>
                                            <option value="P3" ${rowData['Priority'] === 'Contact Later' ? 'selected' : ''}>P3</option>
                                        </select>
                                        <div class="fv-plugins-message-container invalid-feedback"></div>
                                    </div>
                                </div>

                                <div class="d-flex flex-column mb-8">
                                    <div class="d-flex align-items-center">
                <label class="form-check form-check-custom form-check-solid me-10">
                  <input class="form-check-input h-20px w-20px" type="checkbox" name="communication[]" value="linkedin" ${rowData['Linkedin Message'] != '' ? checked="checked" : ''} />
                  <span class="form-check-label fw-bold">Email</span>
                </label>
                <label class="form-check form-check-custom form-check-solid me-10">
                  <input class="form-check-input h-20px w-20px" type="checkbox" name="communication[]" value="email" ${rowData['Email'] != '' ? checked="checked" : ''} />
                  <span class="form-check-label fw-bold">Email</span>
                </label>
                                        <label class="form-check form-check-custom form-check-solid me-10">
                  <input class="form-check-input h-20px w-20px" type="checkbox" name="communication[]" value="whatsapp" ${rowData['Whasapp Message'] != '' ? checked="checked" : ''} />
                  <span class="form-check-label fw-bold">Whatsapp</span>
                </label>
                                        <label class="form-check form-check-custom form-check-solid">
                  <input class="form-check-input h-20px w-20px" type="checkbox" name="communication[]" value="call" ${rowData['Call-1'] != '' ? checked="checked" : ''} />
                  <span class="form-check-label fw-bold">Call</span>
                </label>
              </div>
                                </div>
                                
                                <div class="d-flex flex-column mb-8">
                                    <label class="fs-6 fw-bold mb-2">Target Details</label>
                                    <textarea class="form-control form-control-solid" rows="3" name="target_details" placeholder="Type Target Details"></textarea>
                                </div>
                                <div class="text-center">
                                    <button type="reset" id="kt_modal_new_target_cancel" class="btn btn-light me-3" data-bs-dismiss="modal" aria-label="Close">Cancel</button>
                                    <button type="submit" id="kt_modal_new_target_submit" class="btn btn-primary">
                                        <span class="indicator-label">Submit</span>
                                        <span class="indicator-progress">Please wait...
                                        <span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                    </button>
                                </div>
                                <div></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Append modal to the body if not already present
        if ($('#editRowModal').length === 0) {
            $('body').append(modalHtml);
        } else {
            $('#editRowModal').replaceWith(modalHtml);
        }

        // Show the modal
        $('#editRowModal').modal('show');

        // Handle form submission
        $('#editRowForm').on('submit', function (e) {
            e.preventDefault();

            // Get updated data from form inputs
            var updatedData = {
                'Date Added': $('#editDateAdded').val(),
                'Organization': $('#editOrganization').val(),
                // Retrieve other updated values based on your form structure
            };

            // Update DataTable row data
            var selectedRow = dt.row('.selected'); // Or use row reference from row click
            selectedRow.data(updatedData).draw(false);

            // Make AJAX call to update backend
            $.ajax({
                url: updateEndpoint, // Pass this as a parameter to handle dynamic endpoints
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: function (response) {
                    alert('Row updated successfully!');
                    $('#editRowModal').modal('hide');
                },
                error: function (error) {
                    alert('Failed to update row: ' + error.responseText);
                }
            });
        });
    }

    return {
        init: function () {
            initDatatable();
            handleSearchDatatable();
            // Initialize other methods as needed
        },
        fetchData: fetchData
    };        
};

var contantTable = function () {
    var table;
    var dt;

    var initDatatable = function () {
        contact_dt = $("#contactTable").DataTable({
            searchDelay: 500,
            processing: true,
            serverSide: false,
            order: [[1, 'desc']], // Order by date
            "sDom":"ltipr",
            colReorder: true,
            stateSave: true,
            select: {
                style: 'multi',
                selector: 'td:first-child input[type="checkbox"]',
                className: 'row-selected'
            },
            columns: [
                {
                    data: null,
                    orderable: false,
                    render: function (data, type, row) {
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid">
                                <input class="form-check-input" type="checkbox" value="${data['Name']}" />
                            </div>`;
                    },
                },
                { 
                    data: 'Date',
                    render: function (data, type, row) {
                        const options = { day: '2-digit', month: 'short', year: 'numeric' };
                        return row.Date ? new Date(row.Date).toLocaleDateString('en-US', options): '';
                    }
                },
                {
                    data: 'Name',
                    render: function (data, type, row) {
                        return `${row['Company Name']}<br>
                                <a href="${row['Linkedin URL']}" target="_blank" class="px-2 fs-6"><i class="bi bi-linkedin"></i></a>
                                <a href="${row['Website']}" target="_blank" class="px-2 fs-6"><i class="bi bi-link-45deg"></i></a>`;
                    }
                },
                { data: 'Email Address'},
                {
                    data: 'Phone Number',
                },
                { data: 'Company' },
                { data: 'Designation' },
                { data: 'Level 1 Call' },
                { data: 'Email Sent' },
                { data: 'Whatsapp' },
                { data: 'Linkedin Message'},
                {
                    data: null,
                    orderable: false,
                    className: 'text-end',
                    render: function (data, type, row) {
                        return `
                            <a href="#" class="btn btn-light btn-active-light-primary btn-sm" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-flip="top-end">Actions
                                <span class="svg-icon fs-5 m-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <polygon points="0 0 24 0 24 24 0 24"></polygon>
                                            <path d="M6.70710678,15.7071068 C6.31658249,16.0976311 5.68341751,16.0976311 5.29289322,15.7071068 C4.90236893,15.3165825 4.90236893,14.6834175 5.29289322,14.2928932 L11.2928932,8.29289322 C11.6714722,7.91431428 12.2810586,7.90106866 12.6757246,8.26284586 L18.6757246,13.7628459 C19.0828436,14.1360383 19.1103465,14.7686056 18.7371541,15.1757246 C18.3639617,15.5828436 17.7313944,15.6103465 17.3242754,15.2371541 L12.0300757,10.3841378 L6.70710678,15.7071068 Z" fill="currentColor" fill-rule="nonzero" transform="translate(12.000003, 11.999999) rotate(-180.000000) translate(-12.000003, -11.999999)"></path>
                                        </g>
                                    </svg>
                                </span>
                            </a>
                            <!--begin::Menu-->
                            <div class="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-bold fs-7 w-125px py-4" data-kt-menu="true">
                                <!--begin::Menu item-->
                                <div class="menu-item px-3">
                                    <a href="#" class="menu-link px-3" data-kt-docs-table-filter="edit_row">
                                        Edit
                                    </a>
                                </div>
                                <!--end::Menu item-->

                                <!--begin::Menu item-->
                                <div class="menu-item px-3">
                                    <a href="#" class="menu-link px-3" data-kt-docs-table-filter="delete_row">
                                        Delete
                                    </a>
                                </div>
                                <!--end::Menu item-->
                            </div>
                            <!--end::Menu-->
                        `;
                    },
                },
            ],
            createdRow: function (row, data, dataIndex) {
                // Customize row if needed
            }
        });

        table = contact_dt.$;

        contact_dt.on('draw', function () {
            toggleToolbars();
            handleDeleteRows();
        });

        contact_dt.on('select.dt', () => {
            contact_dt.searchPanes.rebuildPane(0, true);
        });
        
        contact_dt.on('deselect.dt', () => {
            contact_dt.searchPanes.rebuildPane(0, true);
        });
    };

    
    var fetchData = function(){
        $.ajax ({
            url: `https://script.google.com/macros/s/AKfycbw5F_eE_nZg2mvB21i_jv49ynCqR-8703-_WX-sjbNBqmB6uTb1oY5eKujPpiJDu6qM/exec?username=${username}&data=Contacts`,
            success: function(response) {
                contacts = response.data;
                contact_dt.rows.add(contacts).draw()
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Request failed with status:", textStatus);
                console.error("Error thrown:", errorThrown);
                alert('Error loading data.');
            }
        })
    }

    var initToggleToolbar = function () {
        const container = document.querySelector('#companyTable');
        const checkboxes = container.querySelectorAll('[type="checkbox"]');

        // Select elements
        const deleteSelected = document.querySelector('[data-kt-docs-table-select="delete_selected"]');

        // Toggle delete selected toolbar
        checkboxes.forEach(c => {
            c.addEventListener('click', function () {
                setTimeout(function () {
                    toggleToolbars();
                }, 50);
            });
        });

        // Deleted selected rows
        deleteSelected.addEventListener('click', function () {
            // SweetAlert2 pop up --- official docs reference: https://sweetalert2.github.io/
            Swal.fire({
                text: "Are you sure you want to delete selected customers?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                confirmButtonText: "Yes, delete!",
                cancelButtonText: "No, cancel",
                customClass: {
                    confirmButton: "btn fw-bold btn-danger",
                    cancelButton: "btn fw-bold btn-active-light-primary"
                },
            }).then(function (result) {
                if (result.value) {
                    // Simulate delete request -- for demo purpose only
                    Swal.fire({
                        text: "Deleting selected customers",
                        icon: "info",
                        buttonsStyling: false,
                        showConfirmButton: false,
                        timer: 2000
                    }).then(function () {
                        Swal.fire({
                            text: "You have deleted all selected customers!.",
                            icon: "success",
                            buttonsStyling: false,
                            confirmButtonText: "Ok, got it!",
                            customClass: {
                                confirmButton: "btn fw-bold btn-primary",
                            }
                        }).then(function () {
                            // delete row data from server and re-draw datatable
                            dt.draw();
                        });

                        // Remove header checked box
                        const headerCheckbox = container.querySelectorAll('[type="checkbox"]')[0];
                        headerCheckbox.checked = false;
                    });
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "Selected customers was not deleted.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn fw-bold btn-primary",
                        }
                    });
                }
            });
        });
    }

    // Search Datatable
    var handleSearchDatatable = function () {
        const filterSearch = document.querySelector('[data-table-filter="search"]');
        filterSearch.addEventListener('keyup', function (e) {
            dt.search(e.target.value).draw();
        });
    }

    // Delete row
    var handleDeleteRows = () => {
        const deleteButtons = document.querySelectorAll('[data-kt-docs-table-filter="delete_row"]');
        deleteButtons.forEach(d => {
            d.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = e.target.closest('tr');
                const companyName = parent.querySelectorAll('td')[1].innerText;

                Swal.fire({
                    text: `Are you sure you want to delete ${companyName}?`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete!",
                    cancelButtonText: "No, cancel",
                    customClass: {
                        confirmButton: "btn fw-bold btn-danger",
                        cancelButton: "btn fw-bold btn-active-light-primary"
                    }
                }).then(function (result) {
                    if (result.value) {
                        Swal.fire({
                            text: `Deleting ${companyName}`,
                            icon: "info",
                            showConfirmButton: false,
                            timer: 2000
                        }).then(function () {
                            Swal.fire({
                                text: `You have deleted ${companyName}!`,
                                icon: "success",
                                confirmButtonText: "Ok, got it!",
                                customClass: {
                                    confirmButton: "btn fw-bold btn-primary",
                                }
                            }).then(function () {
                                dt.row(parent).remove().draw();
                            });
                        });
                    }
                });
            });
        });
    };

    // Toggle toolbars based on selection
    var toggleToolbars = function () {
        const container = document.getElementById('companyTable');
        const toolbarBase = document.querySelector('[data-kt-docs-table-toolbar="base"]');
        const toolbarSelected = document.querySelector('[data-kt-docs-table-toolbar="selected"]');
        const selectedCount = document.querySelector('[data-kt-docs-table-select="selected_count"]');
        const allCheckboxes = container.querySelectorAll('tbody [type="checkbox"]');
        
        let checkedState = false;
        let count = 0;

        allCheckboxes.forEach(c => {
            if (c.checked) {
                checkedState = true;
                count++;
            }
        });

        if (checkedState) {
            selectedCount.innerHTML = count;
            toolbarBase.classList.add('d-none');
            toolbarSelected.classList.remove('d-none');
        } else {
            toolbarBase.classList.remove('d-none');
            toolbarSelected.classList.add('d-none');
        }
    };

    // Public methods
    return {
        init: function () {
            initDatatable();
            fetchData();
            handleSearchDatatable();
            initToggleToolbar();
            handleFilterDatatable();
            handleDeleteRows();
            handleResetForm();
        }
    };
}();

$('#organizations').on('click', function(){
    if(organizations.length == 0){
        const dataType = 'Organizations'
        const columnDef = [
            {
                data: 'Date Added',
                class: 'text-nowrap',
                render: function (data) { 
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options): '';
                },
            },
            {
                data: 'Organization',
                class: 'mw-600px',
            },
            { 
                data: 'Industry',
                class: 'min-w-150px',
            },
            { 
                data: 'Founded In',
                class: 'text-nowrap',
            },
            { 
                data: 'Location',
                class: 'min-w-150px',
            },
            {
                data: 'Employee Count',
                class: 'text-nowrap',
            },
            {
                data: 'Linkedin URL',
                class: "text-truncate mw-200px",
                render: function (data) {
                    if(data)
                        return `<a href="${data}" target="_blank">${data}</a>`;
                    else
                        return ''
                },
            },
            {
                data: 'Website',
                class: "mw-200px",
                render: function (data) {
                    if(data)
                        return `<a href="${data}" target="_blank">${data}</a>`;
                    else
                        return ''
                },
            }
        ]

        organization_dataTable = new CRMDataTable('#organization-table', columnDef)
        organization_dataTable.init();
        organizations = organization_dataTable.fetchData();
    }
})


$('#working-leads-tab').on('click', function(){
    console.log('#working-leads-tab clicked')
    if(working_leads.length == 0){
        const dataType = 'Working Leads'
        const columnDef = [
            {
                data: 'Date Added',
                render: function (data) { 
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options): '';
                },
            },
            {
                data: 'Organization',
                class: 'min-w-150px',
                render: function (data, type, row) {
                    if (row['Organization Linkedin'] != '') {
                        return `<a href="${row['Organization Linkedin']}" class="text-gray-600">${row['Organization']}</a>`;
                    } else {
                        return row['Organization'];
                    }
                },
            },
            { 
                data: 'POC',
                class: 'min-w-150px',
            },
            { 
                data: 'Designation',
                class: 'min-w-150px',
            },
            {
                data: 'Linkedin',
                class: "text-truncate mw-200px",
                render: function (data) {
                    if(data)
                        return `<a href="${data}" target="_blank">${data}</a>`;
                    else
                        return ''
                },
            },
            {
                data: 'Email ID',
                render: function (data) {
                    return `<a href="mailto:${data}">${data}</a>`;
                },
            },
            { 
                data: 'Contact No',
                class: 'min-w-125px',
            },
            {
                data: 'Linkedin Message',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            { 
                data: 'Email',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            {
                data: 'Whatsapp Message',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            { 
                data: 'Call-1',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            { 
                data: 'Linkedin Follow Up',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            {
                data: 'Whatsapp Follow Up',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            {
                data: 'Email Follow Up',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            {
                data: 'Call-2',
                class: 'text-nowrap',
                render: function (data, type, row, meta) {
                    const options = { day: '2-digit', month: 'short', year: 'numeric' };
                    return data ? new Date(data).toLocaleDateString('en-US', options) : `<div class="form-check form-check-solid form-check-custom form-check-sm"><input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" data-row-index="${meta.row}" data-column-index="${meta.col}" /></div>`
                }
            },
            {  
                data: 'Lead Status',
                class: 'w-auto min-w-150px',
                render: function (data, type, row, meta) {
                    return `<select class="form-select form-select-sm form-select-solid " data-control="select2" data-placeholder="Select an option">
                                <option></option>
                                <option value="Active" ${data === 'Active' ? 'selected' : ''}>Active</option>
                                <option value="Passive" ${data === 'Passive' ? 'selected' : ''}>Passive</option>
                                <option value="Contact Later" ${data === 'Contact Later' ? 'selected' : ''}>Contact Later</option>
                                <option value="Dormant" ${data === 'Dormant' ? 'selected' : ''}>Dormant</option>
                                <option value="Rejected" ${data === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            </select>`
                }
            },
            {
                data: 'Priority',
            },
            { data: 'Next Action' },
            { data: 'Action Date' },
        ]

        workingLeads_dataTable = new CRMDataTable('#working-leads-table', columnDef)
        workingLeads_dataTable.init();
        working_leads = workingLeads_dataTable.fetchData();

    }
})

$('#priority-leads-tab').on('click', function(){

})
