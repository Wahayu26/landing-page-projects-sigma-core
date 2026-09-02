package id.sigmacore.coreapi.inquiry;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class InquiryServiceTest {
    @Autowired
    private InquiryService service;

    @Test
    void storesAnInquiryAndReturnsATrackableReceipt() {
        InquiryReceiptResponse created = service.create(new CreateInquiryRequest(
                "Wahyu",
                "PT Example",
                "wahyu@example.com",
                "08123456789",
                "Kami membutuhkan konsultasi infrastruktur data center.",
                "data-center-cloud",
                "/solusi/data-center-cloud",
                "linkedin",
                "cloud-readiness",
                "whatsapp"
        ));

        InquiryReceiptResponse found = service.getStatus(created.reference());

        assertThat(created.reference()).startsWith("SCS-");
        assertThat(found.status()).isEqualTo(InquiryStatus.RECEIVED);
        assertThat(found.receivedAt()).isNotNull();
    }
}
