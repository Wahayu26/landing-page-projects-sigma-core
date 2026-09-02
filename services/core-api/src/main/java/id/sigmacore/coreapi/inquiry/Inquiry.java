package id.sigmacore.coreapi.inquiry;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inquiries")
public class Inquiry {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "public_reference", nullable = false, unique = true, length = 40)
    private String publicReference;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 160)
    private String company;

    @Column(nullable = false, length = 180)
    private String email;

    @Column(length = 40)
    private String phone;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "interest_solution", length = 120)
    private String interestSolution;

    @Column(name = "source_page", length = 300)
    private String sourcePage;

    @Column(name = "utm_source", length = 120)
    private String utmSource;

    @Column(name = "utm_campaign", length = 160)
    private String utmCampaign;

    @Column(name = "preferred_contact", length = 24)
    private String preferredContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private InquiryStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Inquiry() {}

    public Inquiry(
            String publicReference,
            String name,
            String company,
            String email,
            String phone,
            String message,
            String interestSolution,
            String sourcePage,
            String utmSource,
            String utmCampaign,
            String preferredContact
    ) {
        this.publicReference = publicReference;
        this.name = name;
        this.company = company;
        this.email = email;
        this.phone = phone;
        this.message = message;
        this.interestSolution = interestSolution;
        this.sourcePage = sourcePage;
        this.utmSource = utmSource;
        this.utmCampaign = utmCampaign;
        this.preferredContact = preferredContact;
        this.status = InquiryStatus.RECEIVED;
        this.createdAt = Instant.now();
    }

    public String getPublicReference() { return publicReference; }
    public InquiryStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
