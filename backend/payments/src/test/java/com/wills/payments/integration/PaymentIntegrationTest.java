package com.wills.payments.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import com.wills.payments.domain.dto.PaymentConfirmRequest;
import com.wills.payments.domain.dto.PaymentCreate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public class PaymentIntegrationTest {
    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper mapper;

    @Test
    void createPayment_success() throws Exception {
        String requestBody = """
                {
                "fromAccount": "111",
                "toAccount": "222",
                "amount": "100",
                "currency": "USD"
                }
                """;

        mvc.perform(post("/payments") // backend starts with context path "/api"
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.amount").value("100.0"))
                .andExpect(jsonPath("$.currency").value("USD"));
    }

    @Test
    void createPayment_failure_whenMissingFields() throws Exception {
        PaymentCreate req = new PaymentCreate(
                null,
                "",
                "",
                "100",
                "USD",
                null
        );

        mvc.perform(post("/payments")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fromAccount").exists())
                .andExpect(jsonPath("$.errors.toAccount").exists());
    }

    @Test
    void createPayment_requiresMfa_whenThresholdMet() throws Exception {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );

        mvc.perform(post("/payments")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(req)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.requiresMfa").value(true))
                .andExpect(jsonPath("$.mfaToken").isNotEmpty());
    }

    @Test
    void getPayment_success() throws Exception {
        PaymentCreate req = new PaymentCreate(
                null,
                "111",
                "222",
                "500",
                "USD",
                null
        );
        MvcResult createRes = mvc.perform(post("/payments")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(req)))
                .andReturn();
        String id = JsonPath.read(createRes.getResponse().getContentAsString(), "$.id");

        mvc.perform(get("/payments/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getPayment_failure_whenNotFound() throws Exception {
        mvc.perform(get("/payments/nonexistent-id"))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirmPayment_success_whenMfaNotRequired() throws Exception {
        PaymentCreate createReq = new PaymentCreate(
                null,
                "111",
                "222",
                "100",
                "USD",
                null
        );
        MvcResult createRes = mvc.perform(post("/payments")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(createReq)))
                .andReturn();
        String id = JsonPath.read(createRes.getResponse().getContentAsString(), "$.id");

        PaymentConfirmRequest confirmReq = new PaymentConfirmRequest(null);

        mvc.perform(put("/payments/" + id + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void confirmPayment_success_whenMfaRequired() throws Exception {
        PaymentCreate createReq = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );
        MvcResult createRes = mvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(createReq)))
                .andReturn();
        String id = JsonPath.read(createRes.getResponse().getContentAsString(), "$.id");
        String mfaToken = JsonPath.read(createRes.getResponse().getContentAsString(), "$.mfaToken");

        PaymentConfirmRequest confirmReq = new PaymentConfirmRequest(mfaToken);

        mvc.perform(put("/payments/" + id + "/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void confirmPayment_failure_whenMfaRequired() throws Exception {
        PaymentCreate createReq = new PaymentCreate(
                null,
                "111",
                "222",
                "1500",
                "USD",
                null
        );
        MvcResult createRes = mvc.perform(post("/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(createReq)))
                .andReturn();
        String id = JsonPath.read(createRes.getResponse().getContentAsString(), "$.id");

        mvc.perform(put("/payments/" + id + "/confirm"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Multi-Factor Authentication required"));
    }

    @Test
    void confirmPayment_failure_whenNotFound() throws Exception {
        mvc.perform(put("/payments/nonexistent-id/confirm"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Payment not found"));
    }
}
