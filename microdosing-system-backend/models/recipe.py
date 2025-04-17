from extensions import db, ma  # ✅ Import from extensions


class Recipe(db.Model):
    recipe_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    version = db.Column(db.String(20), nullable=False)

    # ✅ Updated status field
    status = db.Column(
        db.Enum("Released", "Unreleased", name="recipe_status_enum"),
        nullable=False,
        default="Unreleased",
        server_default="Unreleased"
    )

    created_by = db.Column(db.Integer, db.ForeignKey("user.user_id"), nullable=False)
    created_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp())
    updated_at = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # ✅ Barcode field
    barcode_id = db.Column(db.String(100), unique=True, nullable=True)
    no_of_materials = db.Column(db.Integer, nullable=True)



class RecipeMaterial(db.Model):
    recipe_material_id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.recipe_id"), nullable=False, unique=True)  # unique on recipe_id
    material_id = db.Column(db.Integer, db.ForeignKey("material.material_id"), nullable=False)
    
    # New fields
    set_point = db.Column(db.Numeric(10, 2), nullable=True)
    actual = db.Column(db.Numeric(10, 2), nullable=True)
    status = db.Column(
        db.Enum("pending", "in progress", "created", name="recipe_material_status"),
        nullable=False,
        default="pending",
        server_default="pending"
    )
    
    # Remove unique constraint on material_id for each recipe_id
    # We want to make sure only one recipe_material exists per recipe_id, not material_id.

class RecipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Recipe
