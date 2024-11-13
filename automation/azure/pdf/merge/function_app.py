import azure.functions as func
import logging
import io
import json
import base64
import pypdfium2 as pdfium

app = func.FunctionApp(http_auth_level=func.AuthLevel.FUNCTION)

@app.route(route="merge")
def merge(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    if req.method == 'POST':
        try:
            # Function used in each MERGE operation to get the PDF file bytes
            def base64_to_pdf(base64_string):
                file_bytes = base64.b64decode(base64_string, validate=True)
                if file_bytes[0:4] != b"%PDF":
                    raise ValueError("Missing the PDF magic number")
                return file_bytes

            def merge_pdfs(pdf_base64_list):
                result = pdfium.PdfDocument.new()
                for pdf_base64 in pdf_base64_list:
                    pdf_bytes = base64_to_pdf(pdf_base64)
                    result.import_pages(pdfium.PdfDocument(pdf_bytes, autoclose=True))
                merged_pdf_bytes = io.BytesIO()
                result.save(merged_pdf_bytes)
                return base64.b64encode(merged_pdf_bytes.getvalue()).decode("utf-8")

            # Form an array of base64 strings of the pdfs to merge from the $content parameters & call the merge_pdfs function on that array
            pdf_base64_strings_list = [item.get('$content') for item in req.get_json()]
            merged_pdf_base64_string = merge_pdfs(pdf_base64_strings_list)

            '''HTTP response for MERGE operation'''
            # Return the merged PDF base64 string in a Power Automate content object in an HTTP response
            return func.HttpResponse(
                body=json.dumps({
                    "$content-type": "application/pdf",
                    "$content": merged_pdf_base64_string
                }),
                mimetype="application/json",
                status_code=200
            )
        except Exception as e:
            # If there is an error, log the error & then return the error message in an HTTP response
            debug_error = logging.exception("An error occurred:")
            return func.HttpResponse(
                str(e),
                status_code=400
            )