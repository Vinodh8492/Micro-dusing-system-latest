import React, { useState, useEffect } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";



const FormulaDetails = () => {
  const [order, setOrder] = useState({
    order_id: 101,
    recipe_name: 'Formula A',
    materials: [],
  });

  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState({});
  const [setPoints, setSetPoints] = useState({});
  const [actualValues, setActualValues] = useState({});
  const [formulaCreatedMap, setFormulaCreatedMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMaterial, setCurrentMaterial] = useState(null);
  const [recipeMaterialStatus, setRecipeMaterialStatus] = useState({});

  // Top of your file (after imports)
const FORMULA_ORDER_KEY = "formula-dosing-order";

// Function to save order
const saveFormulaDosingOrderToLocalStorage = (recipeList) => {
  const ids = recipeList.map((r) => r.recipe_id);
  localStorage.setItem(FORMULA_ORDER_KEY, JSON.stringify(ids));
};

// Function to load and reorder based on stored order
const reorderRecipesFromLocalStorage = (originalList) => {
  const storedOrder = JSON.parse(localStorage.getItem(FORMULA_ORDER_KEY));
  if (!storedOrder) return originalList;

  const reordered = storedOrder
    .map((id) => originalList.find((r) => r.recipe_id === id))
    .filter(Boolean); // remove nulls if any IDs don't match

  // Append any new ones not in storedOrder
  const newOnes = originalList.filter(
    (r) => !storedOrder.includes(r.recipe_id)
  );

  return [...reordered, ...newOnes];
};

  


useEffect(() => {
  const fetchRecipes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/recipes");
      const recipesData = response.data;
      const reordered = reorderRecipesFromLocalStorage(recipesData);
      setRecipes(reordered);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/materials");
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    }
  };

  fetchRecipes();
  fetchMaterials();
}, []);


  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/materials');
        const rawMaterials = response.data || [];

        const transformedMaterials = rawMaterials.map((mat, idx) => ({
          id: mat.id || idx + 1,
          title: mat.title,
          barcode: mat.barcode_id,
          setPoint: mat.maximum_quantity,
          actual: mat.current_quantity,
          unit: mat.unit_of_measure,
          recipe: 'Formula A',
        }));

        setOrder(prev => ({
          ...prev,
          materials: transformedMaterials,
        }));
      } catch (error) {
        console.error('Error fetching materials:', error);
      }
    };

    fetchMaterials();
  }, []);


  

  useEffect(() => {
    if (order.materials.length > 0 && currentIndex < order.materials.length) {
      setCurrentMaterial(order.materials[currentIndex]);
    } else {
      setCurrentMaterial(null);
    }
  }, [order.materials, currentIndex]);

  const handleMaterialChange = (recipeId, event) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [recipeId]: event.target.value,
    }));
  };

  const handleSetPointChange = (recipeId, value) => {
    setSetPoints(prev => ({
      ...prev,
      [recipeId]: value,
    }));
  };

  const handleActualChange = (recipeId, value) => {
    setActualValues(prev => ({
      ...prev,
      [recipeId]: value,
    }));
  };

  


  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newRecipes = [...recipes];
    [newRecipes[index - 1], newRecipes[index]] = [newRecipes[index], newRecipes[index - 1]];
    setRecipes(newRecipes);
    saveFormulaDosingOrderToLocalStorage(newRecipes);
    if (currentIndex === index) setCurrentIndex(index - 1);
  };
  
  const handleMoveDown = (index) => {
    if (index === recipes.length - 1) return;
    const newRecipes = [...recipes];
    [newRecipes[index + 1], newRecipes[index]] = [newRecipes[index], newRecipes[index + 1]];
    setRecipes(newRecipes);
    saveFormulaDosingOrderToLocalStorage(newRecipes);
    if (currentIndex === index) setCurrentIndex(index + 1);
  };
  
  

  const createRecipeMaterial = async (recipeId, materialName, setPoint, actual) => {
    try {
      const selectedMaterial = materials.find(m => m.title === materialName);
      if (!selectedMaterial) {
        alert("Material not found!");
        return;
      }

      const payload = {
        recipe_id: recipeId,
        material_id: selectedMaterial.material_id,
        set_point: parseFloat(setPoint),
        actual: parseFloat(actual),
        status: "created" // Optional if backend sets default
      };

      const response = await axios.post("http://127.0.0.1:5000/api/recipe_materials", payload);
      alert("✅ Recipe material saved successfully!");
      console.log("Saved:", response.data);

      setRecipeMaterialStatus(prev => ({
        ...prev,
        [recipeId]: "created"
      }));

    } catch (error) {
      console.error("Error saving recipe material:", error);
      alert("❌ Failed to save recipe material.");
    }
  };

  const confirmDosing = async () => {
    const recipe = recipes[currentIndex];
    const materialName = selectedMaterials[recipe.recipe_id];
    const setPoint = setPoints[recipe.recipe_id];
    const actual = actualValues[recipe.recipe_id];

    if (!materialName || !setPoint || !actual) {
      alert("Missing values!");
      return;
    }

    if (parseFloat(setPoint) > parseFloat(actual)) {
      alert("⚠️ Set Point cannot be higher than Actual value.");
      return; // Stop execution if condition is met
    }

    // const tolerance = 0.5;
  
    // const minAcceptable = parseFloat(setPoint) * (1 - tolerance);
    // const maxAcceptable = parseFloat(setPoint) * (1 + tolerance);

    // if (actualWeight < minAcceptable || actualWeight > maxAcceptable) {
    //   alert(`❌ Dosing out of tolerance!\nEntered: ${actualWeight}\nAcceptable: ${minAcceptable} - ${maxAcceptable}`);
    //   return;
    // }

    await createRecipeMaterial(recipe.recipe_id, materialName, setPoint, actual);

    setFormulaCreatedMap(prev => ({
      ...prev,
      [currentIndex]: true
    }));

    setOrder(prev => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[currentIndex] = {
        ...updatedMaterials[currentIndex],
        
      };
      return { ...prev, materials: updatedMaterials };
    });

    advanceToNext();
  };

  const advanceToNext = () => {
    
    if (currentIndex + 1 < order.materials.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert('✅ All materials processed. Order Complete.');
    }
  };

  const bypassMaterial = () => {
    advanceToNext();
  };
  

  console.log("recipes :", recipes)
  console.log("materials :", materials)


  return (
    <div className="p-6 text-black bg-white min-h-screen">
      <h2 className="text-3xl font-bold mb-6"> Formula Details </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border bg-gray-200">
          <thead className="bg-gray-300 text-sm">
            <tr>
            <th className="p-3 border">Reorder</th>
              <th className="p-3 border">Recipe</th>
              <th className="p-3 border">Material</th>
              <th className="p-3 border">Set Point</th>
              <th className="p-3 border">Actual</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((mat, idx) => (
              <tr
                key={mat.recipe_id}
                className={idx === currentIndex ? 'bg-blue-50' : 'bg-white'}
              >
                <td className="p-3 border">
                  <div className="flex flex-col items-center gap-1">
                    <ArrowUpwardIcon
                      fontSize="small"
                      onClick={() => handleMoveUp(idx)}
                      className={`cursor-pointer text-gray-700 hover:text-black ${idx === 0 ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                        }`}
                    />
                    <ArrowDownwardIcon
                      fontSize="small"
                      onClick={() => handleMoveDown(idx)}
                      className={`cursor-pointer text-gray-700 hover:text-black ${idx === recipes.length - 1 ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''
                        }`}
                    />
                  </div>
                </td>
                <td className="p-3 border">{mat.name}</td>
                <td className="p-3 border font-semibold">
                  <FormControl fullWidth>
                    <InputLabel>Material</InputLabel>
                    <Select
                      value={selectedMaterials[mat.recipe_id] || ''}
                      onChange={(e) => handleMaterialChange(mat.recipe_id, e)}
                      label="Material"
                    >
                      {materials.map((material) => (
                        <MenuItem key={material.material_id} value={material.title}>
                          {material.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border rounded"
                    value={setPoints[mat.recipe_id] ?? ''}
                    onChange={(e) => handleSetPointChange(mat.recipe_id, e.target.value)}
                    placeholder="SetPoint"
                  />
                </td>
                <td className="p-3 border">
                  <input
                    type="number"
                    value={actualValues[mat.recipe_id] ?? ''}
                    onChange={(e) => handleActualChange(mat.recipe_id, e.target.value)}
                    className="border p-1 rounded w-24"
                    placeholder="Actual"
                  />
                </td>
                <td className="p-3 border">
                  {formulaCreatedMap[idx]
                    ? 'Formula Created'
                    : idx === currentIndex
                      ? 'In Progress'
                      : 'Pending'}
                </td>
                <td className="p-3 border">
                  {idx === currentIndex && (
                    <div className="flex gap-2">
                      <button
                        onClick={confirmDosing}
                        className="bg-green-500 text-white px-3 py-1 rounded shadow-md hover:bg-green-600 transition"
                      >
                        {recipeMaterialStatus[recipes[currentIndex]?.recipe_id] === "created" ? "Update" : "Save"}
                      </button>
                      <button
                        onClick={bypassMaterial}
                        className="bg-red-500 text-white px-3 py-1 rounded shadow-md hover:bg-red-600 transition"
                      >
                        🚫 Bypass
                      </button>
                    </div>
                  )}
                </td>

                


              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FormulaDetails;
