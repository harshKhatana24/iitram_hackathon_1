console.log("contacts.js")
const baseURL = "http://localhost:8081";
const viewContactModel=document.getElementById("view-contact-model");

// options with default values
const options = {
    placement: 'bottom-right',
    backdrop: 'dynamic',
    backdropClasses:
        'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
    closable: true,
    onHide: () => {
        console.log('modal is hidden');
    },
    onShow: () => {
        console.log('modal is shown');
    },
    onToggle: () => {
        console.log('modal has been toggled');
    },
};

// instance options object
const instanceOptions = {
    id: 'view-contact-model',
    override: true
};


const contactModel=new Modal(viewContactModel, options, instanceOptions);

function openContactModel(){
    contactModel.show();
}


function closeContactModel() {
    contactModel.hide();
}


async function loadContactData(id) {
    try {
        console.log("Contact ID received:", id); // Debugging

        // if (!id) {
        //     throw new Error("Invalid Contact ID");
        // }

        // Fetch data from API
        const response = await fetch(`${baseURL}/api/contact/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const textData = await response.text(); // Read raw response
        console.log("Raw Response:", textData);

        const data = JSON.parse(textData); // Convert text to JSON
        console.log("Parsed Data:", data);

        // Ensure required fields exist
        if (!data.name || !data.email || !data.phoneNumber) {
            throw new Error("Incomplete contact data received");
        }

        // 🔹 Use vCard Format (Best for Contact Info)
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
EMAIL:${data.email}
TEL:${data.phoneNumber}
ADR:${data.address || "N/A"}
URL:${data.websiteLink || ""}
URL:${data.linkedInLink || ""}
END:VCARD`;

        // Generate QR Code
        const qrCodeUrl = await new Promise((resolve, reject) => {
            QRCode.toDataURL(vCardData, { errorCorrectionLevel: 'H' }, function (err, url) {
                if (err) {
                    console.error("Error generating QR code:", err);
                    reject(err);
                }
                resolve(url);
            });
        });

        // Create a Blob to enable QR code download
        const blob = await fetch(qrCodeUrl).then(res => res.blob());
        const qrDownloadUrl = URL.createObjectURL(blob);

        // Display Contact Details using SweetAlert2
        Swal.fire({
            title: `<strong>Contact Details</strong>`,
            html: `
                <div style="text-align: left; font-size: 16px;">
                    <img src="${data.picture || 'default-avatar.png'}" alt="Profile Picture" style="width: 100px; height: 100px; border-radius: 50%; display: block; margin: 0 auto;">
                    <p><i class="fas fa-user"></i> <strong>Name:</strong> ${data.name}</p>
                    <p><i class="fas fa-envelope"></i> <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                    <p><i class="fas fa-phone"></i> <strong>Phone:</strong> <a href="tel:${data.phoneNumber}">${data.phoneNumber}</a></p>
                    <p><i class="fas fa-map-marker-alt"></i> <strong>Address:</strong> ${data.address || "N/A"}</p>
                    <p><i class="fas fa-globe"></i> <strong>Website:</strong> ${data.websiteLink ? `<a href="${data.websiteLink}" target="_blank">${data.websiteLink}</a>` : "N/A"}</p>
                    <p><i class="fab fa-linkedin"></i> <strong>LinkedIn:</strong> ${data.linkedInLink ? `<a href="${data.linkedInLink}" target="_blank">${data.linkedInLink}</a>` : "N/A"}</p>
                    <p><strong>Favorite:</strong> 
                        ${data.favourite
                ? '<i class="fas fa-star" style="color: gold;"></i> Yes'
                : '<i class="far fa-star" style="color: gray;"></i> No'}
                    </p>

                    <!-- QR Code Image -->
                    <img src="${qrCodeUrl}" alt="Contact QR Code" style="width: 150px; height: 150px; display: block; margin: 10px auto;">

                    <!-- Download Button -->
                    <a href="${qrDownloadUrl}" download="Contact_QR.png">
                        <button style="margin-top: 10px; padding: 5px 10px; background-color: green; color: white; border: none; cursor: pointer;">
                            <i class="fas fa-download"></i> Download QR Code
                        </button>
                    </a>

                    <!-- Share Buttons -->
                    <div style="margin-top: 10px;">
                        <button onclick="copyToClipboard('${qrCodeUrl}')" style="padding: 5px 10px; background-color: blue; color: white; border: none; cursor: pointer;">
                            <i class="fas fa-copy"></i> Copy QR Link
                        </button>
                    </div>
                </div>
            `,
            icon: "info",
            showCloseButton: true,
            confirmButtonText: "Close",
        });

    } catch (error) {
        console.error("Error fetching contact data:", error);
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.message || "Failed to load contact details!",
        });
    }
}




// ✅ Function to Copy QR Code URL to Clipboard
function copyToClipboard(url) {
    navigator.clipboard.writeText(url).then(() => {
        Swal.fire({
            icon: "success",
            title: "Copied!",
            text: "QR Code link copied to clipboard.",
        });
    }).catch(err => {
        console.error("Error copying QR Code:", err);
    });
}

// ✅ Function to Share QR Code via WhatsApp, Email, or Native Share
function shareQR(url) {
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: "Scan this QR Code",
            text: "Here is a QR code for a contact.",
            url: url,
        }).catch(err => console.error("Error sharing QR Code:", err));
    } else {
        // Fallback: Share via WhatsApp
        const whatsappUrl = `https://wa.me/?text=Scan this QR Code: ${url}`;
        window.open(whatsappUrl, "_blank");
    }
}





//delete contact

async function deleteContact(id){

    Swal.fire({
        title: "Do you want to delete the contact?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            if (result.isConfirmed) {
                const url=`${baseURL}/user/contacts/delete/`+id;
                window.location.replace(url);
            }
        }
    });

}



//export data
function exportData(){
    TableToExcel.convert(document.getElementById("table_content_print"), {
        name: "contact.xlsx",
        sheet: {
            name: "Sheet 1"
        }
    });
}


// async function loadContactData(id) {
//     try {
//         console.log(id); // Log the received ID
//
//         // Fetch data from the API
//         const response = await fetch(`${baseURL}/api/contact/${id}`);
//
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//
//         const data = await response.json();
//
//         // Log the fetched data
//         console.log(data);
//
//         document.querySelector('#contact_image').src=data.picture;
//         document.querySelector('#contact_name').innerHTML=data.name;
//         document.querySelector('#contact_email').innerHTML=data.email;
//         document.querySelector('#contact_address').innerHTML=data.address;
//         document.querySelector('#contact_phone').innerHTML=data.phoneNumber;
//
//         document.querySelector('#contact_website').href=data.websiteLink;
//         document.querySelector('#contact_linkedin').href=data.linkedInLink;
//
//         document.querySelector('#contact_website').innerHTML=data.websiteLink;
//         document.querySelector('#contact_linkedin').innerHTML=data.linkedInLink;
//
//         const contactFavorite = document.querySelector('#contact_favorite');
//         if (data.favourite) {
//             contactFavorite.innerHTML =
//                 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#FFD43B" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>'
//         }else{
//             //false
//             contactFavorite.innerHTML  = ""
//         }
//
//
//         openContactModel();
//
//         // Perform further actions with the data
//         // e.g., update the DOM with contact details
//     } catch (error) {
//         console.error("Error fetching contact data:", error);
//     }
// }

