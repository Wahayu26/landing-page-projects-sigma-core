package id.sigmacore.coreapi.inquiry;

import java.time.Instant;

public record InquiryReceiptResponse(String reference, InquiryStatus status, Instant receivedAt) {
    static InquiryReceiptResponse from(Inquiry inquiry) {
        return new InquiryReceiptResponse(
                inquiry.getPublicReference(),
                inquiry.getStatus(),
                inquiry.getCreatedAt()
        );
    }
}

