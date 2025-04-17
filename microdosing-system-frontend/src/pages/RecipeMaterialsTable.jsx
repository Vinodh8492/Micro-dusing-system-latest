import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Box, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Tooltip, Button } from '@mui/material';
import { AddCircleOutline as AddCircleOutlineIcon, Visibility as VisibilityIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from '@mui/icons-material';

const RecipeMaterialsTable = () => {
  const [recipeMaterials, setRecipeMaterials] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Fetching Recipes, Materials, and Recipe Materials
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipes");
        setRecipes(response.data);
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

    const fetchRecipeMaterials = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/api/recipe_materials");
        setRecipeMaterials(response.data);
      } catch (error) {
        console.error("Error fetching recipe materials:", error);
      }
    };

    fetchRecipes();
    fetchMaterials();
    fetchRecipeMaterials();
  }, []);

  // Get recipe name based on recipe_id
  const getRecipeName = (recipe_id) => {
    const recipe = recipes.find((rec) => rec.recipe_id === recipe_id);
    return recipe ? recipe.name : 'Unknown Recipe';
  };

  // Get material name based on material_id
  const getMaterialName = (material_id) => {
    const material = materials.find((mat) => mat.material_id === material_id);
    return material ? material.title : 'Unknown Material';
  };

  return (
    <Container maxWidth="x2" sx={{ py: 4, height: "auto", borderRadius: 2, boxShadow: 3 }} component={Paper}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Formula Details
        </Typography>
      </Box>

      <Table sx={{ border: "1px solid", borderColor: "#000", borderCollapse: "collapse" }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.100" }}>
            {["Recipe Name", "Material Name", "Set Point", "Actual", "Status"].map((header) => (
              <TableCell
                key={header}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  fontWeight: 600,
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {recipeMaterials.map((material) => (
            <TableRow key={material.recipe_material_id}>
              <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                {getRecipeName(material.recipe_id)}
              </TableCell>
              <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                {getMaterialName(material.material_id)}
              </TableCell>
              <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                {material.set_point}
              </TableCell>
              <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                {material.actual}
              </TableCell>
              <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                <Chip
                  label={material.status}
                  color={material.status === "Active" ? "success" : "error"}
                  size="medium"
                  sx={{
                    backgroundColor: material.status === "Active" ? "lightgreen" : "lightyellow",
                    color: material.status === "Active" ? "green" : "black",
                  }}
                />
              </TableCell>
              {/* <TableCell sx={{ border: "1px solid", borderColor: "divider" }}>
                <Tooltip title="View" arrow>
                  <IconButton
                    sx={{
                      backgroundColor: "deepskyblue",
                      color: "white",
                      mr: 1,
                    }}
                    size="medium"
                    onClick={() => alert("View action")}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit" arrow>
                  <IconButton
                    sx={{
                      backgroundColor: "dodgerblue",
                      color: "white",
                      mr: 1,
                    }}
                    size="medium"
                    onClick={() => alert("Edit action")}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete" arrow>
                  <IconButton
                    sx={{
                      backgroundColor: "red",
                      color: "white",
                    }}
                    size="medium"
                    onClick={() => alert("Delete action")}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move Up" arrow>
                  <IconButton
                    sx={{ color: "gray" }}
                    size="small"
                    onClick={() => alert("Move up action")}
                  >
                    <ArrowUpwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Move Down" arrow>
                  <IconButton
                    sx={{ color: "gray" }}
                    size="small"
                    onClick={() => alert("Move down action")}
                  >
                    <ArrowDownwardIcon />
                  </IconButton>
                </Tooltip>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default RecipeMaterialsTable;
