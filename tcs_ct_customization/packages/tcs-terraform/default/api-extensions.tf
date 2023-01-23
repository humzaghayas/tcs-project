resource "commercetools_api_extension" "tsc-order-create-extension" {
  key = "tsc-order-create-extension"

  destination = {
    type = "HTTP"
    url  = "https://${var.region_functions}-${var.gcp_project_id}.cloudfunctions.net/tcsOrderCreate"
  }

  trigger {
    resource_type_id = "order"
    actions          = ["Create"]
  }
}