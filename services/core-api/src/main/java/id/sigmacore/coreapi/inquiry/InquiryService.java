package id.sigmacore.coreapi.inquiry;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;

@Service
public class InquiryService {
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();
    private final InquiryRepository repository;

    public InquiryService(InquiryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public InquiryReceiptResponse create(CreateInquiryRequest request) {
        Inquiry inquiry = new Inquiry(
                nextReference(),
                request.name().trim(),
                request.company().trim(),
                request.email().trim().toLowerCase(),
                normalize(request.phone()),
                request.message().trim(),
                normalize(request.interestSolution()),
                normalize(request.sourcePage()),
                normalize(request.utmSource()),
                normalize(request.utmCampaign()),
                normalize(request.preferredContact())
        );
        return InquiryReceiptResponse.from(repository.save(inquiry));
    }

    @Transactional(readOnly = true)
    public InquiryReceiptResponse getStatus(String reference) {
        return repository.findByPublicReference(reference)
                .map(InquiryReceiptResponse::from)
                .orElseThrow(() -> new InquiryNotFoundException(reference));
    }

    private String nextReference() {
        StringBuilder suffix = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            suffix.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return "SCS-" + LocalDate.now().getYear() + "-" + suffix;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
