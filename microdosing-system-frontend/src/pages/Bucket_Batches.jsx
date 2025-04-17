import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Tooltip, IconButton, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const Bucket_Batches = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const barcodeRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/storage");
        const bucketData = response.data;

        const enrichedBuckets = await Promise.all(
          bucketData.map(async (bucket) => {
            try {
              const matRes = await axios.get(
                `http://127.0.0.1:5000/api/materials/${bucket.material_id}`
              );
              return { ...bucket, material: matRes.data };
            } catch (err) {
              console.error(`Failed to fetch material ${bucket.material_id}`, err);
              return { ...bucket, material: null };
            }
          })
        );

        setBuckets(enrichedBuckets);
      } catch (error) {
        console.error("Error fetching buckets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuckets();
  }, []);

  useEffect(() => {
    buckets.forEach((bucket) => {
      const el = barcodeRefs.current[bucket.barcode];
      if (bucket.barcode && el) {
        JsBarcode(el, bucket.barcode, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: true,
          lineColor: "black",
          background: "transparent",
        });
      }
    });
  }, [buckets]);

  const handleDelete = async (bucket_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:5000/api/storage/delete/${bucket_id}`);
          setBuckets(buckets.filter((b) => b.bucket_id !== bucket_id));
          Swal.fire("Deleted!", "The storage bucket has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the storage bucket.", "error");
        }
      }
    });
  };

  const handleEdit = async (bucket) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Bucket",
      html: `
        <label>Location ID</label>
        <input id="swal-location" class="swal2-input" value="${bucket.location_id || ""}">
        <label>Barcode</label>
        <input id="swal-barcode" class="swal2-input" value="${bucket.barcode || ""}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const location = document.getElementById("swal-location").value;
        const barcode = document.getElementById("swal-barcode").value;
        if (!location || !barcode) {
          Swal.showValidationMessage("Both fields are required.");
          return null;
        }
        return { location, barcode };
      },
    });

    if (formValues) {
      try {
        await axios.put(`http://127.0.0.1:5000/api/storage/update/${bucket.bucket_id}`, {
          location_id: formValues.location,
          barcode: formValues.barcode,
        });

        // Update state locally
        setBuckets((prev) =>
          prev.map((b) =>
            b.bucket_id === bucket.bucket_id
              ? { ...b, location_id: formValues.location, barcode: formValues.barcode }
              : b
          )
        );

        Swal.fire("Updated!", "Bucket details have been updated.", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Error!", "Failed to update the bucket.", "error");
      }
    }
  };

  
  const handleView = async (barcode) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/storage/${barcode}`);
      const data = response.data;

      Swal.fire({
        title: `<strong>Bucket Details</strong>`,
        html: `
          <div style="text-align: left;">
            <p><strong>Bucket ID:</strong> ${data.bucket_id}</p>
            <p><strong>Material ID:</strong> ${data.material_id}</p>
            <p><strong>Material Name:</strong> ${data.material?.title || "-"}</p>
            <p><strong>Location ID:</strong> ${data.location_id || "-"}</p>
            <p><strong>Barcode:</strong> ${data.barcode}</p>
            <p><strong>Created At:</strong> ${data.created_at || "-"}</p>
            <p><strong>Updated At:</strong> ${data.updated_at || "-"}</p>
          </div>
        `,
        confirmButtonText: 'Close',
        width: 500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || "Failed to fetch bucket data",
      });
    }
  };


  const groupedByLocation = buckets.reduce((acc, bucket) => {
    const location = bucket.location_id || "Unknown";
    if (!acc[location]) acc[location] = [];
    acc[location].push(bucket);
    return acc;
  }, {});

  if (loading) return <p>Loading...</p>;

  const handleReset = () => {
    // Add your reset logic here, for example, resetting filters or state
    Swal.fire("Reset", "Reset action performed.", "info");
  };
  
  const handleReassign = () => {
    // Add your reassign logic here, for example, reassigning buckets or materials
    Swal.fire("Reassign", "Reassign action performed.", "info");
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
  <div>
    <Typography
      sx={{
        fontWeight: "bold",
        fontSize: {
          xs: "1rem",
          sm: "1.25rem",
          md: "1.5rem",
          lg: "2rem",
        },
      }}
    >
      Bucket Storage
    </Typography>
  </div>
  <div className="flex gap-2">
    <button
      onClick={() => navigate("/create-storage")}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
    >
      Add Storage
    </button>

    <button
      onClick={handleReset}
      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
    >
      Reset
    </button>

    <button
      onClick={handleReassign}
      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
    >
      Reassign
    </button>
  </div>
</div>

      {Object.entries(groupedByLocation).map(([location, bucketList]) => (
        <div key={location} className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">{location}</h2>
          </div>

          <div className="w-full overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white border border-gray-200 text-center">
              <thead className="bg-gray-100 text-xs font-semibold text-gray-700">
                <tr>
                  <th className="p-3 border-b">Bucket ID</th>
                  <th className="p-3 border-b">Material ID</th>
                  <th className="p-3 border-b">Material Name</th>
                  <th className="p-3 border-b">Bucket Location</th>
                  <th className="p-3 border-b">Barcode</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800">
                {bucketList.map((bucket) => (
                  <tr key={bucket.bucket_id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{bucket.bucket_id}</td>
                    <td className="p-3">{bucket.material_id}</td>
                    <td className="p-3">{bucket.material?.title || "-"}</td>
                    <td className="p-3">{bucket.location_id || "-"}</td>
                    <td className="p-3">
                      <svg
                        className="h-10 w-auto mx-auto"
                        ref={(el) => (barcodeRefs.current[bucket.barcode] = el)}
                      ></svg>
                    </td>
                    <td className="p-3">
                    <Tooltip title="View">
                        <IconButton
                          onClick={() => handleView(bucket.barcode)}
                          sx={{
                            backgroundColor: "#6a1b9a",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#4a148c" },
                            mr: 1,
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEdit(bucket)}
                          sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#1565c0" },
                            mr: 1,
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleDelete(bucket.bucket_id)}
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            "&:hover": { backgroundColor: "#b71c1c" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Bucket_Batches;
