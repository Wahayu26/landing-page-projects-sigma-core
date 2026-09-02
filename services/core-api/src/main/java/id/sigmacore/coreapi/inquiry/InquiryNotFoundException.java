package id.sigmacore.coreapi.inquiry;

public class InquiryNotFoundException extends RuntimeException {
    public InquiryNotFoundException(String reference) {
        super("Inquiry not found: " + reference);
    }
}

