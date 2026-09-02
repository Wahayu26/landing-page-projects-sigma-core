package id.sigmacore.coreapi.inquiry;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateInquiryRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 160) String company,
        @NotBlank @Email @Size(max = 180) String email,
        @Size(max = 40) String phone,
        @NotBlank @Size(min = 10, max = 5000) String message,
        @Size(max = 120) String interestSolution,
        @Size(max = 300) String sourcePage,
        @Size(max = 120) String utmSource,
        @Size(max = 160) String utmCampaign,
        @Size(max = 24) String preferredContact
) {}
